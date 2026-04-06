import { App, PluginSettingTab, Setting } from "obsidian";
import WorkoutLoggerPlugin from "./main";
import { t } from "./i18n";

export interface WorkoutLoggerSettings {
  exerciseFolder: string;
  calculateCalories: boolean;
  bodyWeight: number;
  bodyFatPercentage: number;
  bodyMetricsNote: string;
}

export const DEFAULT_SETTINGS: WorkoutLoggerSettings = {
  exerciseFolder: "Gym/Exercises",
  calculateCalories: false,
  bodyWeight: 60,
  bodyFatPercentage: 0,
  bodyMetricsNote: "Gym/BodyMetrics",
};

export class WorkoutLoggerSettingTab extends PluginSettingTab {
  plugin: WorkoutLoggerPlugin;

  constructor(app: App, plugin: WorkoutLoggerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /** Attach a <datalist> to an input element with the given options. */
  private attachDatalist(
    inputEl: HTMLInputElement,
    listId: string,
    options: string[],
  ): void {
    // Reuse existing datalist if already present (e.g. on re-render)
    let datalist = this.containerEl.querySelector<HTMLDataListElement>(
      `#${listId}`,
    );
    if (!datalist) {
      datalist = this.containerEl.createEl("datalist", {
        attr: { id: listId },
      });
    } else {
      datalist.empty();
    }
    for (const opt of options) {
      datalist.createEl("option", { value: opt });
    }
    inputEl.setAttribute("list", listId);
  }

  /** All folder paths in the vault, sorted. */
  private folderOptions(): string[] {
    return this.app.vault
      .getAllFolders()
      .map((f) => f.path)
      .filter((p) => p !== "/")
      .sort();
  }

  /** All markdown file paths in the vault (without .md), sorted. */
  private noteOptions(): string[] {
    return this.app.vault
      .getMarkdownFiles()
      .map((f) => f.path.replace(/\.md$/, ""))
      .sort();
  }

  display(): void {
    const { containerEl } = this;
    const i18n = t();
    containerEl.empty();

    // Exercise Folder — suggest vault folders
    new Setting(containerEl)
      .setName(i18n.settingExerciseFolderName)
      .setDesc(i18n.settingExerciseFolderDesc)
      .addText((text) => {
        this.attachDatalist(
          text.inputEl,
          "wl-folder-list",
          this.folderOptions(),
        );
        text
          .setPlaceholder("e.g., Gym/Exercises")
          .setValue(this.plugin.settings.exerciseFolder)
          .onChange(async (value) => {
            this.plugin.settings.exerciseFolder = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(i18n.settingCalcCaloriesName)
      .setDesc(i18n.settingCalcCaloriesDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.calculateCalories)
          .onChange(async (value) => {
            this.plugin.settings.calculateCalories = value;
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    if (this.plugin.settings.calculateCalories) {
      new Setting(containerEl)
        .setName(i18n.settingBodyWeightName)
        .setDesc(i18n.settingBodyWeightDesc)
        .addText((text) =>
          text
            .setValue(this.plugin.settings.bodyWeight.toString())
            .onChange(async (value) => {
              this.plugin.settings.bodyWeight = parseFloat(value) || 60;
              await this.plugin.saveSettings();
            }),
        );

      new Setting(containerEl)
        .setName(i18n.settingBodyFatName)
        .setDesc(i18n.settingBodyFatDesc)
        .addText((text) =>
          text
            .setValue(this.plugin.settings.bodyFatPercentage.toString())
            .onChange(async (value) => {
              this.plugin.settings.bodyFatPercentage = parseFloat(value) || 0;
              await this.plugin.saveSettings();
            }),
        );

      // Body Metrics Note — suggest vault notes
      new Setting(containerEl)
        .setName(i18n.settingBodyMetricsNoteName)
        .setDesc(i18n.settingBodyMetricsNoteDesc)
        .addText((text) => {
          this.attachDatalist(text.inputEl, "wl-note-list", this.noteOptions());
          text
            .setPlaceholder("e.g., Gym/BodyMetrics")
            .setValue(this.plugin.settings.bodyMetricsNote)
            .onChange(async (value) => {
              this.plugin.settings.bodyMetricsNote = value;
              await this.plugin.saveSettings();
            });
        });
    }
  }
}
