import {
  App,
  Modal,
  Setting,
  Notice,
  TFolder,
  TFile,
  DropdownComponent,
} from "obsidian";
import WorkoutLoggerPlugin from "./main";
import { getOrCreateExerciseNote, appendLog, appendCardioLog, appendBodyMetrics } from "./file";
import { EQUIPMENT_METS, calculateCalories, calculateWalkingCalorie } from "./utils";

const TARGET_MUSCLES = ["胸", "背中", "肩", "腕", "腹", "足", "有酸素"];
const EQUIPMENT_TYPES = [
  "フリーウェイト",
  "ダンベル",
  "マシン",
  "自重",
  "その他",
];

export class LoggerModal extends Modal {
  plugin: WorkoutLoggerPlugin;
  exerciseName: string = "";
  sets: { weight: number; reps: number; rpe: number | null }[] = [];
  logDate: string = window.moment().format("YYYY-MM-DD");
  targetMuscle: string = "";
  targetMuscleDropdown: DropdownComponent | null = null;
  equipment: string = "";
  equipmentDropdown: DropdownComponent | null = null;
  bodyWeight: number = 0;
  bodyFatPercentage: number = 0;
  workoutDuration: number = 0; // in minutes (strength)
  // Cardio-specific fields
  cardioSpeed: number = 0;    // km/h
  cardioIncline: number = 0;  // %
  cardioDuration: number = 0; // minutes
  // Dynamic section containers (set in onOpen)
  private calorieContainer: HTMLElement | null = null;
  private inputsContainer: HTMLElement | null = null;

  constructor(app: App, plugin: WorkoutLoggerPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h1", { text: "🏋️‍♂️ Log Workout Set" });

    this.bodyWeight = this.plugin.settings.bodyWeight;
    this.bodyFatPercentage = this.plugin.settings.bodyFatPercentage;

    this.renderExerciseSelect(contentEl);
    this.renderTargetMuscleSelect(contentEl);
    this.renderEquipmentSelect(contentEl);
    this.renderLogDatePicker(contentEl);

    // 動的セクションはDOM上の最終位置に固定し、targetMuscle 変更時に再描画
    this.calorieContainer = contentEl.createDiv();
    this.inputsContainer = contentEl.createDiv();

    this.refreshDynamicSections();
    this.renderButtons(contentEl);
  }

  private isCardioMode(): boolean {
    return this.targetMuscle === "有酸素";
  }

  private refreshDynamicSections(): void {
    if (!this.calorieContainer || !this.inputsContainer) return;
    this.calorieContainer.empty();
    this.inputsContainer.empty();

    if (this.plugin.settings.calculateCalories) {
      this.renderCalorieInputs(this.calorieContainer);
    }

    if (this.isCardioMode()) {
      this.renderCardioInputs(this.inputsContainer);
    } else {
      this.renderInputs(this.inputsContainer);
    }
  }

  private renderCalorieInputs(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName("Body Weight (kg)")
      .setDesc("Used for calorie calculation. Syncs with plugin settings.")
      .addText((text) => {
        text.inputEl.type = "number";
        text.setValue(this.bodyWeight.toString());
        text.onChange((value) => {
          this.bodyWeight = parseFloat(value) || 0;
        });
      });

    new Setting(containerEl)
      .setName("Body Fat Percentage (%)")
      .setDesc(
        "Current body fat %. Logged with the entry and syncs with plugin settings.",
      )
      .addText((text) => {
        text.inputEl.type = "number";
        text.setValue(this.bodyFatPercentage.toString());
        text.onChange((value) => {
          this.bodyFatPercentage = parseFloat(value) || 0;
        });
      });

    if (!this.isCardioMode()) {
      new Setting(containerEl)
        .setName("Workout Duration (minutes)")
        .setDesc("Duration of this exercise (e.g., 30 for 30 mins).")
        .addText((text) => {
          text.inputEl.type = "number";
          text.setValue(this.workoutDuration.toString());
          text.onChange((value) => {
            this.workoutDuration = parseFloat(value) || 0;
          });
        });
    }
  }

  private renderCardioInputs(containerEl: HTMLElement) {
    const card = containerEl.createDiv({ cls: "cardio-input-card" });
    card.createEl("p", { cls: "cardio-input-card__label", text: "有酸素運動" });

    new Setting(card)
      .setName("速度 (km/h)")
      .addText((text) => {
        text.inputEl.type = "number";
        text.inputEl.step = "0.1";
        text.setValue(this.cardioSpeed > 0 ? this.cardioSpeed.toString() : "");
        text.onChange((value) => {
          this.cardioSpeed = parseFloat(value) || 0;
        });
      });

    new Setting(card)
      .setName("傾斜 (%)")
      .addText((text) => {
        text.inputEl.type = "number";
        text.inputEl.step = "0.5";
        text.setValue(this.cardioIncline > 0 ? this.cardioIncline.toString() : "");
        text.onChange((value) => {
          this.cardioIncline = parseFloat(value) || 0;
        });
      });

    new Setting(card)
      .setName("時間 (分)")
      .addText((text) => {
        text.inputEl.type = "number";
        text.setValue(this.cardioDuration > 0 ? this.cardioDuration.toString() : "");
        text.onChange((value) => {
          this.cardioDuration = parseFloat(value) || 0;
        });
      });
  }

  /**
   * Render the Select/Text field for exercise name
   */
  private renderExerciseSelect(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName("Exercise")
      .setDesc("Select an existing exercise or type a new one to create it.")
      .addText((text) => {
        text.setPlaceholder("e.g. Bench Press");

        // Populate datalist for autocomplete based on existing files in folder
        const dataListId = "exercises-list";
        let datalist = containerEl.querySelector(
          `#${dataListId}`,
        ) as HTMLDataListElement;
        if (!datalist) {
          datalist = containerEl.createEl("datalist", {
            attr: { id: dataListId },
          });
        }

        const folderPath = this.plugin.settings.exerciseFolder;
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (folder instanceof TFolder) {
          folder.children.forEach((child) => {
            if (child.name.endsWith(".md")) {
              datalist.createEl("option", {
                value: child.name.replace(".md", ""),
              });
            }
          });
        }

        text.inputEl.setAttribute("list", dataListId);

        text.onChange(async (value) => {
          this.exerciseName = value;

          const fileName = this.exerciseName.endsWith(".md")
            ? this.exerciseName
            : `${this.exerciseName}.md`;
          const filePath = `${this.plugin.settings.exerciseFolder}/${fileName}`;
          const file = this.app.vault.getAbstractFileByPath(filePath);

          if (file instanceof TFile) {
            const fileCache = this.app.metadataCache.getFileCache(file);
            const frontmatter = fileCache?.frontmatter;

            if (frontmatter && frontmatter.target_muscle) {
              const targetMuscle = Array.isArray(frontmatter.target_muscle)
                ? frontmatter.target_muscle[0]
                : frontmatter.target_muscle;
              if (targetMuscle && this.targetMuscleDropdown) {
                this.targetMuscle = targetMuscle;
                this.targetMuscleDropdown.setValue(targetMuscle);
              }
            }

            if (frontmatter && frontmatter.equipment) {
              if (this.equipmentDropdown) {
                this.equipment = frontmatter.equipment;
                this.equipmentDropdown.setValue(frontmatter.equipment);
              }
            }
          }
        });
      });
  }

  /**
   * Render the dropdown for target muscle
   */
  private renderTargetMuscleSelect(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName("Target Muscle")
      .setDesc("Select the primary muscle group targeted.")
      .addDropdown((dropdown) => {
        this.targetMuscleDropdown = dropdown;
        TARGET_MUSCLES.forEach((muscle) => {
          dropdown.addOption(muscle, muscle);
        });
        dropdown.setValue(this.targetMuscle).onChange((value) => {
          this.targetMuscle = value;
          this.refreshDynamicSections();
        });
      });
  }

  /**
   * Render the dropdown for equipment type
   */
  private renderEquipmentSelect(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName("Equipment")
      .setDesc("Select the equipment used.")
      .addDropdown((dropdown) => {
        this.equipmentDropdown = dropdown;
        EQUIPMENT_TYPES.forEach((equipment) => {
          dropdown.addOption(equipment, equipment);
        });
        dropdown.setValue(this.equipment).onChange((value) => {
          this.equipment = value;
        });
      });
  }

  /**
   * Render the date picker for the log
   */
  private renderLogDatePicker(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName("Log Date")
      .setDesc("Select the date for the workout log.")
      .addText((text) => {
        text.inputEl.type = "date";
        text.setValue(this.logDate).onChange((value) => {
          this.logDate = value;
        });
      });
  }

  /**
   * Render the weight, reps, and set type inputs
   */
  private renderInputs(containerEl: HTMLElement) {
    const setsContainer = containerEl.createDiv({ cls: "sets-container" });

    const addSet = () => {
      const setIndex = this.sets.length;
      const setDiv = setsContainer.createDiv({ cls: "set-input-group" });

      new Setting(setDiv)
        .setClass("set-input-block")
        .setName(`Set ${setIndex + 1} - Weight (kg/lbs)`)
        .addText((text) => {
          text.inputEl.type = "number";
          text.onChange((value) => {
            this.sets[setIndex].weight = parseFloat(value) || 0;
          });
        });

      new Setting(setDiv)
        .setClass("set-input-block")
        .setName(`Set ${setIndex + 1} - Reps`)
        .addText((text) => {
          text.inputEl.type = "number";
          text.onChange((value) => {
            this.sets[setIndex].reps = parseInt(value, 10) || 0;
          });
        });

      new Setting(setDiv)
        .setClass("set-input-block")
        .setName(`Set ${setIndex + 1} - RPE`)
        .addDropdown((dropdown) => {
          dropdown.addOption("", "-");
          for (let rpe = 6; rpe <= 10; rpe += 0.5) {
            const val = rpe.toString();
            dropdown.addOption(val, val);
          }
          dropdown.setValue("").onChange((value) => {
            this.sets[setIndex].rpe = value ? parseFloat(value) : null;
          });
        });

      const removeButton = setDiv.createEl("button", { text: "Remove Set" });
      removeButton.addEventListener("click", () => {
        this.sets.splice(setIndex, 1);
        setDiv.remove();
        this.updateSetLabels(setsContainer);
      });

      this.sets.push({ weight: 0, reps: 0, rpe: null });
    };

    const addSetButton = containerEl.createEl("button", { text: "Add Set" });
    addSetButton.addEventListener("click", addSet);

    // Initialize with one set
    this.sets = [];
    addSet();
  }

  /**
   * Update set labels after adding/removing sets
   */
  private updateSetLabels(setsContainer: HTMLElement) {
    const setGroups = setsContainer.querySelectorAll(".set-input-group");
    setGroups.forEach((group, index) => {
      const weightSetting = group.querySelector(
        ".setting-item:first-child .setting-name",
      );
      const repsSetting = group.querySelector(
        ".setting-item:nth-child(2) .setting-name",
      );
      const rpeSetting = group.querySelector(
        ".setting-item:nth-child(3) .setting-name",
      );
      if (weightSetting)
        weightSetting.textContent = `Set ${index + 1} - Weight (kg/lbs)`;
      if (repsSetting) repsSetting.textContent = `Set ${index + 1} - Reps`;
      if (rpeSetting) rpeSetting.textContent = `Set ${index + 1} - RPE`;
    });
  }

  /**
   * Render log / cancel buttons
   */
  private renderButtons(containerEl: HTMLElement) {
    const buttonContainer = containerEl.createDiv({
      cls: "modal-button-container",
    });
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "flex-end";
    buttonContainer.style.gap = "10px";
    buttonContainer.style.marginTop = "20px";

    const cancelButton = buttonContainer.createEl("button", { text: "Cancel" });
    cancelButton.addEventListener("click", () => {
      this.close();
    });

    const submitButton = buttonContainer.createEl("button", {
      text: "Log Set",
      cls: "mod-cta",
    });
    submitButton.addEventListener("click", async () => {
      await this.submit();
    });
  }

  async submit() {
    if (!this.exerciseName) {
      new Notice("⚠️ Please enter an exercise name!");
      return;
    }

    try {
      const file = await getOrCreateExerciseNote(
        this.app,
        this.plugin.settings.exerciseFolder,
        this.exerciseName,
        this.targetMuscle,
        this.equipment,
      );

      if (this.isCardioMode()) {
        await this.submitCardio(file);
      } else {
        await this.submitStrength(file);
      }

      this.close();
    } catch (error) {
      console.error(error);
      new Notice("❌ Failed to log the set. Check console for details.");
    }
  }

  private async submitStrength(file: TFile) {
    const validSets = this.sets.filter((s) => s.weight > 0 && s.reps > 0);

    if (validSets.length === 0) {
      new Notice("⚠️ Enter at least one valid set (weight and reps > 0)!");
      return;
    }

    let extraData: { duration: number; calories: number } | undefined;

    if (this.plugin.settings.calculateCalories) {
      this.plugin.settings.bodyWeight =
        this.bodyWeight || this.plugin.settings.bodyWeight;
      this.plugin.settings.bodyFatPercentage =
        this.bodyFatPercentage || this.plugin.settings.bodyFatPercentage;
      await this.plugin.saveSettings();

      const mets = EQUIPMENT_METS[this.equipment] || 5.0;
      const calories = calculateCalories(
        mets,
        this.bodyWeight,
        this.workoutDuration / 60,
      );

      extraData = {
        duration: this.workoutDuration,
        calories: calories,
      };
    }

    await appendLog(this.app, file, validSets, this.logDate, extraData);

    if (
      this.plugin.settings.calculateCalories &&
      this.plugin.settings.bodyMetricsNote &&
      this.bodyWeight > 0
    ) {
      await appendBodyMetrics(
        this.app,
        this.plugin.settings.bodyMetricsNote,
        this.logDate,
        this.bodyWeight,
        this.bodyFatPercentage,
      );
    }

    const setsSummary = validSets
      .map((s) => `${s.weight}kg x ${s.reps}reps`)
      .join(", ");
    new Notice(`✅ Logged ${setsSummary} for ${this.exerciseName}`);
  }

  private async submitCardio(file: TFile) {
    if (this.cardioDuration <= 0) {
      new Notice("⚠️ 時間（分）を入力してください！");
      return;
    }

    const calories = calculateWalkingCalorie(
      this.bodyWeight || this.plugin.settings.bodyWeight,
      this.cardioSpeed,
      this.cardioIncline,
      this.cardioDuration,
    );

    await appendCardioLog(
      this.app,
      file,
      this.logDate,
      this.cardioSpeed,
      this.cardioIncline,
      this.cardioDuration,
      Math.round(calories),
    );

    if (
      this.plugin.settings.calculateCalories &&
      this.plugin.settings.bodyMetricsNote &&
      this.bodyWeight > 0
    ) {
      await appendBodyMetrics(
        this.app,
        this.plugin.settings.bodyMetricsNote,
        this.logDate,
        this.bodyWeight,
        this.bodyFatPercentage,
      );
    }

    new Notice(
      `✅ Logged ${this.cardioDuration}min cardio (${Math.round(calories)} kcal) for ${this.exerciseName}`,
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
