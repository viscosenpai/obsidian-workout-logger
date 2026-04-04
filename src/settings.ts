import { App, PluginSettingTab, Setting } from "obsidian";
import WorkoutLoggerPlugin from "./main";

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

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Exercise Folder")
      .setDesc("The folder where your exercise notes are stored.")
      .addText((text) =>
        text
          .setPlaceholder("e.g., Gym/Exercises")
          .setValue(this.plugin.settings.exerciseFolder)
          .onChange(async (value) => {
            this.plugin.settings.exerciseFolder = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Calculate Calories Burned")
      .setDesc(
        "Calculate calories burned based on METs, body weight, and workout duration.",
      )
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
        .setName("Default Body Weight (kg)")
        .setDesc("Used for calorie calculation.")
        .addText((text) =>
          text
            .setPlaceholder("e.g., 60")
            .setValue(this.plugin.settings.bodyWeight.toString())
            .onChange(async (value) => {
              this.plugin.settings.bodyWeight = parseFloat(value) || 60;
              await this.plugin.saveSettings();
            }),
        );

      new Setting(containerEl)
        .setName("Default Body Fat Percentage (%)")
        .setDesc("Logged alongside each workout entry to track body composition over time.")
        .addText((text) =>
          text
            .setPlaceholder("e.g., 20")
            .setValue(this.plugin.settings.bodyFatPercentage.toString())
            .onChange(async (value) => {
              this.plugin.settings.bodyFatPercentage = parseFloat(value) || 0;
              await this.plugin.saveSettings();
            }),
        );

      new Setting(containerEl)
        .setName("Body Metrics Note")
        .setDesc("体重・体脂肪率を日次記録するノートのパス（カロリー計算オン時に使用）。")
        .addText((text) =>
          text
            .setPlaceholder("e.g., Gym/BodyMetrics")
            .setValue(this.plugin.settings.bodyMetricsNote)
            .onChange(async (value) => {
              this.plugin.settings.bodyMetricsNote = value;
              await this.plugin.saveSettings();
            }),
        );
    }
  }
}
