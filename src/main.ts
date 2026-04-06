import { Plugin } from "obsidian";
import {
  WorkoutLoggerSettings,
  DEFAULT_SETTINGS,
  WorkoutLoggerSettingTab,
} from "./settings";
import { LoggerModal } from "./LoggerModal";
import { DashboardView, DASHBOARD_VIEW_TYPE } from "./DashboardView";

export default class WorkoutLoggerPlugin extends Plugin {
  settings: WorkoutLoggerSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    // Register the dashboard view
    this.registerView(
      DASHBOARD_VIEW_TYPE,
      (leaf) => new DashboardView(leaf, this),
    );

    // Ribbon opens the dashboard
    const ribbonIconEl = this.addRibbonIcon(
      "bar-chart-2",
      "Workout dashboard",
      async () => {
        await this.activateDashboard();
      },
    );
    ribbonIconEl.addClass("workout-logger-ribbon-class");

    // Command IDs must not include the plugin ID (Obsidian adds it automatically)
    this.addCommand({
      id: "open-dashboard",
      name: "Open dashboard",
      callback: async () => {
        await this.activateDashboard();
      },
    });

    this.addCommand({
      id: "open-logger",
      name: "Open logger",
      callback: () => {
        new LoggerModal(this.app, this).open();
      },
    });

    this.addSettingTab(new WorkoutLoggerSettingTab(this.app, this));
  }

  onunload() {
    // Do not detach leaves — let Obsidian manage leaf lifecycle
  }

  async activateDashboard(): Promise<void> {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({ type: DASHBOARD_VIEW_TYPE, active: true });
    }
    await workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
