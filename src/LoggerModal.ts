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
import {
  getOrCreateExerciseNote,
  appendLog,
  appendCardioLog,
  appendBodyMetrics,
} from "./file";
import {
  EQUIPMENT_METS,
  calculateCalories,
  calculateWalkingCalorie,
} from "./utils";
import { t } from "./i18n";

const TARGET_MUSCLES = [
  "Chest",
  "Back",
  "Shoulder",
  "Arms",
  "Abs",
  "Legs",
  "Cardio",
];
const EQUIPMENT_TYPES = [
  "Barbell",
  "Dumbbell",
  "Machine",
  "Bodyweight",
  "Other",
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
  cardioSpeed: number = 0; // km/h
  cardioIncline: number = 0; // %
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
    const i18n = t();
    contentEl.createEl("h1", { text: i18n.modalTitle });

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
    return this.targetMuscle === "Cardio";
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
    const i18n = t();
    new Setting(containerEl)
      .setName(i18n.bodyWeightLabel)
      .setDesc(i18n.bodyWeightDesc)
      .addText((text) => {
        text.inputEl.type = "number";
        text.setValue(this.bodyWeight.toString());
        text.onChange((value) => {
          this.bodyWeight = parseFloat(value) || 0;
        });
      });

    new Setting(containerEl)
      .setName(i18n.bodyFatLabel)
      .setDesc(i18n.bodyFatDesc)
      .addText((text) => {
        text.inputEl.type = "number";
        text.setValue(this.bodyFatPercentage.toString());
        text.onChange((value) => {
          this.bodyFatPercentage = parseFloat(value) || 0;
        });
      });

    if (!this.isCardioMode()) {
      new Setting(containerEl)
        .setName(i18n.workoutDurationLabel)
        .setDesc(i18n.workoutDurationDesc)
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
    const i18n = t();
    const card = containerEl.createDiv({ cls: "cardio-input-card" });
    card.createEl("p", {
      cls: "cardio-input-card__label",
      text: i18n.cardioSectionLabel,
    });

    new Setting(card).setName(i18n.cardioSpeedLabel).addText((text) => {
      text.inputEl.type = "number";
      text.inputEl.step = "0.1";
      text.setValue(this.cardioSpeed > 0 ? this.cardioSpeed.toString() : "");
      text.onChange((value) => {
        this.cardioSpeed = parseFloat(value) || 0;
      });
    });

    new Setting(card).setName(i18n.cardioInclineLabel).addText((text) => {
      text.inputEl.type = "number";
      text.inputEl.step = "0.5";
      text.setValue(
        this.cardioIncline > 0 ? this.cardioIncline.toString() : "",
      );
      text.onChange((value) => {
        this.cardioIncline = parseFloat(value) || 0;
      });
    });

    new Setting(card).setName(i18n.cardioDurationLabel).addText((text) => {
      text.inputEl.type = "number";
      text.setValue(
        this.cardioDuration > 0 ? this.cardioDuration.toString() : "",
      );
      text.onChange((value) => {
        this.cardioDuration = parseFloat(value) || 0;
      });
    });
  }

  /**
   * Render the Select/Text field for exercise name
   */
  private renderExerciseSelect(containerEl: HTMLElement) {
    const i18n = t();
    new Setting(containerEl)
      .setName(i18n.exerciseLabel)
      .setDesc(i18n.exerciseDesc)
      .addText((text) => {
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

        text.onChange((value) => {
          this.exerciseName = value;

          const fileName = this.exerciseName.endsWith(".md")
            ? this.exerciseName
            : `${this.exerciseName}.md`;
          const filePath = `${this.plugin.settings.exerciseFolder}/${fileName}`;
          const file = this.app.vault.getAbstractFileByPath(filePath);

          if (file instanceof TFile) {
            const fileCache = this.app.metadataCache.getFileCache(file);
            const frontmatter = fileCache?.frontmatter;

            let muscleChanged = false;
            if (frontmatter && frontmatter.target_muscle) {
              const targetMuscle = Array.isArray(frontmatter.target_muscle)
                ? frontmatter.target_muscle[0]
                : frontmatter.target_muscle;
              if (targetMuscle && this.targetMuscleDropdown) {
                this.targetMuscle = targetMuscle;
                this.targetMuscleDropdown.setValue(targetMuscle);
                muscleChanged = true;
              }
            }

            if (frontmatter && frontmatter.equipment) {
              if (this.equipmentDropdown) {
                this.equipment = frontmatter.equipment;
                this.equipmentDropdown.setValue(frontmatter.equipment);
              }
            }

            if (muscleChanged) {
              this.refreshDynamicSections();
            }
          }
        });
      });
  }

  /**
   * Render the dropdown for target muscle
   */
  private renderTargetMuscleSelect(containerEl: HTMLElement) {
    const i18n = t();
    new Setting(containerEl)
      .setName(i18n.targetMuscleLabel)
      .setDesc(i18n.targetMuscleDesc)
      .addDropdown((dropdown) => {
        this.targetMuscleDropdown = dropdown;
        TARGET_MUSCLES.forEach((muscle, idx) => {
          dropdown.addOption(muscle, i18n.targetMuscleOptions[idx] ?? muscle);
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
    const i18n = t();
    new Setting(containerEl)
      .setName(i18n.equipmentLabel)
      .setDesc(i18n.equipmentDesc)
      .addDropdown((dropdown) => {
        this.equipmentDropdown = dropdown;
        EQUIPMENT_TYPES.forEach((equipment, idx) => {
          dropdown.addOption(
            equipment,
            i18n.equipmentTypeOptions[idx] ?? equipment,
          );
        });
        dropdown.setValue(this.equipment).onChange((value) => {
          this.equipment = value;
          this.refreshDynamicSections();
        });
      });
  }

  /**
   * Render the date picker for the log
   */
  private renderLogDatePicker(containerEl: HTMLElement) {
    const i18n = t();
    new Setting(containerEl)
      .setName(i18n.logDateLabel)
      .setDesc(i18n.logDateDesc)
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
    const i18n = t();
    const setsContainer = containerEl.createDiv({ cls: "sets-container" });

    const isBodyweight = () => this.equipment === "Bodyweight";

    const addSet = () => {
      const setIndex = this.sets.length;
      const setDiv = setsContainer.createDiv({ cls: "set-input-group" });

      if (!isBodyweight()) {
        new Setting(setDiv)
          .setClass("set-input-block")
          .setName(i18n.setWeight(setIndex + 1))
          .addText((text) => {
            text.inputEl.type = "number";
            text.onChange((value) => {
              this.sets[setIndex].weight = parseFloat(value) || 0;
            });
          });
      }

      new Setting(setDiv)
        .setClass("set-input-block")
        .setName(i18n.setReps(setIndex + 1))
        .addText((text) => {
          text.inputEl.type = "number";
          text.onChange((value) => {
            this.sets[setIndex].reps = parseInt(value, 10) || 0;
          });
        });

      new Setting(setDiv)
        .setClass("set-input-block")
        .setName(i18n.setRpe(setIndex + 1))
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

      const removeButton = setDiv.createEl("button", { text: i18n.removeSet });
      removeButton.addEventListener("click", () => {
        this.sets.splice(setIndex, 1);
        setDiv.remove();
        this.updateSetLabels(setsContainer);
      });

      this.sets.push({ weight: isBodyweight() ? 1 : 0, reps: 0, rpe: null });
    };

    const addSetButton = containerEl.createEl("button", { text: i18n.addSet });
    addSetButton.addEventListener("click", addSet);

    this.sets = [];
    addSet();
  }

  /**
   * Update set labels after adding/removing sets
   */
  private updateSetLabels(setsContainer: HTMLElement) {
    const i18n = t();
    const isBodyweight = this.equipment === "Bodyweight";
    const setGroups = setsContainer.querySelectorAll(".set-input-group");
    setGroups.forEach((group, index) => {
      const items = group.querySelectorAll(".setting-item");
      if (isBodyweight) {
        // No weight field: items[0]=reps, items[1]=rpe
        if (items[0])
          items[0].querySelector(".setting-name")!.textContent = i18n.setReps(
            index + 1,
          );
        if (items[1])
          items[1].querySelector(".setting-name")!.textContent = i18n.setRpe(
            index + 1,
          );
      } else {
        if (items[0])
          items[0].querySelector(".setting-name")!.textContent = i18n.setWeight(
            index + 1,
          );
        if (items[1])
          items[1].querySelector(".setting-name")!.textContent = i18n.setReps(
            index + 1,
          );
        if (items[2])
          items[2].querySelector(".setting-name")!.textContent = i18n.setRpe(
            index + 1,
          );
      }
    });
  }

  /**
   * Render log / cancel buttons
   */
  private renderButtons(containerEl: HTMLElement) {
    const i18n = t();
    const buttonContainer = containerEl.createDiv({
      cls: "modal-button-container",
    });

    const cancelButton = buttonContainer.createEl("button", {
      text: i18n.cancel,
    });
    cancelButton.addEventListener("click", () => {
      this.close();
    });

    const submitButton = buttonContainer.createEl("button", {
      text: i18n.logSet,
      cls: "mod-cta",
    });
    submitButton.addEventListener("click", () => {
      void this.submit();
    });
  }

  async submit() {
    const i18n = t();
    if (!this.exerciseName) {
      new Notice(i18n.noticeNoExercise);
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
      new Notice(i18n.noticeFailed);
    }
  }

  private async submitStrength(file: TFile) {
    const i18n = t();
    const validSets = this.sets.filter((s) => s.weight > 0 && s.reps > 0);

    if (validSets.length === 0) {
      new Notice(i18n.noticeNoValidSet);
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
      const perSetDuration = this.workoutDuration / validSets.length;
      const perSetCalories = calculateCalories(
        mets,
        this.bodyWeight,
        perSetDuration / 60,
      );

      extraData = {
        duration: Math.round(perSetDuration * 10) / 10,
        calories: perSetCalories,
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

    const isBodyweight = this.equipment === "Bodyweight";
    const setsSummary = validSets
      .map((s) =>
        isBodyweight ? `BW x ${s.reps}reps` : `${s.weight}kg x ${s.reps}reps`,
      )
      .join(", ");
    new Notice(i18n.noticeLoggedStrength(setsSummary, this.exerciseName));
  }

  private async submitCardio(file: TFile) {
    const i18n = t();
    if (this.cardioDuration <= 0) {
      new Notice(i18n.noticeNoDuration);
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
      i18n.noticeLoggedCardio(
        this.cardioDuration,
        Math.round(calories),
        this.exerciseName,
      ),
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
