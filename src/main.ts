import { Plugin } from "obsidian";
import {
  WorkoutLoggerSettings,
  DEFAULT_SETTINGS,
  WorkoutLoggerSettingTab,
} from "./settings";
import { LoggerModal } from "./LoggerModal";

export default class WorkoutLoggerPlugin extends Plugin {
  settings: WorkoutLoggerSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    // Adds a ribbon icon
    const ribbonIconEl = this.addRibbonIcon(
      "dumbbell",
      "Workout Logger",
      (evt: MouseEvent) => {
        new LoggerModal(this.app, this).open();
      },
    );
    ribbonIconEl.addClass("workout-logger-ribbon-class");

    // Adds a command
    this.addCommand({
      id: "open-workout-logger",
      name: "Open Logger",
      callback: () => {
        new LoggerModal(this.app, this).open();
      },
    });

    // Add settings tab
    this.addSettingTab(new WorkoutLoggerSettingTab(this.app, this));
  }

  onunload() {
    // cleanup on unload if needed
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
