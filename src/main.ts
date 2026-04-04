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
      "Workout Dashboard",
      () => {
        this.activateDashboard();
      },
    );
    ribbonIconEl.addClass("workout-logger-ribbon-class");

    // Command: open dashboard
    this.addCommand({
      id: "open-workout-dashboard",
      name: "Open Dashboard",
      callback: () => {
        this.activateDashboard();
      },
    });

    // Command: open logger modal (unchanged)
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
    this.app.workspace.detachLeavesOfType(DASHBOARD_VIEW_TYPE);
  }

  async activateDashboard(): Promise<void> {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf(false);
      await leaf.setViewState({ type: DASHBOARD_VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
