import { App, PluginSettingTab, Setting } from 'obsidian';
import WorkoutLoggerPlugin from './main';

export interface WorkoutLoggerSettings {
  exerciseFolder: string;
}

export const DEFAULT_SETTINGS: WorkoutLoggerSettings = {
  exerciseFolder: 'Gym/Exercises'
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
      .setName('Exercise Folder')
      .setDesc('The folder where your exercise notes are stored.')
      .addText(text => text
        .setPlaceholder('e.g., Gym/Exercises')
        .setValue(this.plugin.settings.exerciseFolder)
        .onChange(async (value) => {
          this.plugin.settings.exerciseFolder = value;
          await this.plugin.saveSettings();
        }));
  }
}
