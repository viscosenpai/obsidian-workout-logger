import { ItemView, WorkspaceLeaf, TFile, TFolder, normalizePath } from "obsidian";
import WorkoutLoggerPlugin from "./main";
import { t } from "./i18n";

export const DASHBOARD_VIEW_TYPE = "workout-dashboard";

interface ExerciseEntry {
  date: string;
  weight: number;
  reps: number;
  rm: number;
  volume: number;
  calories: number;
}

interface BodyMetricsEntry {
  date: string;
  bodyWeight: number;
  bodyFatPercentage: number;
}

interface DayPoint {
  date: string;
  value: number;
}

type Period = "7d" | "30d" | "365d" | "all";

const CHART_WIDTH = 480;
const CHART_HEIGHT = 200;
const CHART_PAD = { top: 20, right: 20, bottom: 44, left: 52 };

export class DashboardView extends ItemView {
  plugin: WorkoutLoggerPlugin;
  private currentPeriod: Period = "30d";
  private selectedExercise: string = "";
  private exerciseNames: string[] = [];
  private bodyMetricsData: BodyMetricsEntry[] = [];
  private exerciseData: ExerciseEntry[] = [];
  private caloriesData: DayPoint[] = [];

  constructor(leaf: WorkspaceLeaf, plugin: WorkoutLoggerPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return DASHBOARD_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Workout Dashboard";
  }

  getIcon(): string {
    return "bar-chart-2";
  }

  async onOpen(): Promise<void> {
    await this.loadAll();
    this.render();
  }

  onClose(): Promise<void> {
    return Promise.resolve();
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────

  private async loadAll(): Promise<void> {
    this.exerciseNames = this.loadExerciseNames();
    if (this.exerciseNames.length > 0 && !this.selectedExercise) {
      this.selectedExercise = this.exerciseNames[0];
    }
    this.bodyMetricsData = await this.loadBodyMetrics();
    if (this.selectedExercise) {
      this.exerciseData = await this.loadExerciseData(this.selectedExercise);
    }
    this.caloriesData = await this.loadAllCalories();
  }

  private loadExerciseNames(): string[] {
    const folderPath = this.plugin.settings.exerciseFolder;
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!(folder instanceof TFolder)) return [];
    return folder.children
      .filter((f): f is TFile => f instanceof TFile && f.name.endsWith(".md"))
      .map((f) => f.name.replace(".md", ""))
      .sort();
  }

  private async loadBodyMetrics(): Promise<BodyMetricsEntry[]> {
    const notePath = this.plugin.settings.bodyMetricsNote;
    if (!notePath) return [];
    const normalizedPath = normalizePath(
      notePath.endsWith(".md") ? notePath : `${notePath}.md`,
    );
    const file = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (!(file instanceof TFile)) return [];

    const content = await this.app.vault.read(file);
    const results: BodyMetricsEntry[] = [];
    const re =
      /\[date:: ([^\]]+)\].*\[body_weight:: ([^\]]+)\](?:.*\[body_fat_percentage:: ([^\]]+)\])?/;

    for (const line of content.split("\n")) {
      const m = re.exec(line);
      if (!m) continue;
      const bw = parseFloat(m[2]);
      if (isNaN(bw)) continue;
      const bf = m[3] ? parseFloat(m[3]) : 0;
      results.push({
        date: m[1].trim(),
        bodyWeight: bw,
        bodyFatPercentage: isNaN(bf) ? 0 : bf,
      });
    }
    return results.sort((a, b) => a.date.localeCompare(b.date));
  }

  private async loadAllCalories(): Promise<DayPoint[]> {
    const map = new Map<string, number>();
    for (const name of this.exerciseNames) {
      const entries = await this.loadExerciseData(name);
      for (const e of entries) {
        if (e.calories > 0) {
          map.set(e.date, (map.get(e.date) ?? 0) + e.calories);
        }
      }
    }
    return Array.from(map.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async loadExerciseData(exerciseName: string): Promise<ExerciseEntry[]> {
    const folderPath = this.plugin.settings.exerciseFolder;
    const filePath = normalizePath(`${folderPath}/${exerciseName}.md`);
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!(file instanceof TFile)) return [];

    const content = await this.app.vault.read(file);
    const results: ExerciseEntry[] = [];
    const re =
      /\[date:: ([^\]]+)\].*\[weight:: ([^\]]+)\].*\[reps:: ([^\]]+)\].*\[volume:: ([^\]]+)\].*\[rm:: ([^\]]+)\]/;
    const caloriesRe = /\[calories:: ([^\]]+)\]/;

    for (const line of content.split("\n")) {
      const m = re.exec(line);
      if (!m) continue;
      const weight = parseFloat(m[2]);
      const reps = parseInt(m[3]);
      const volume = parseFloat(m[4]);
      const rm = parseFloat(m[5]);
      if (isNaN(weight) || isNaN(reps)) continue;
      const cm = caloriesRe.exec(line);
      const calories = cm ? parseFloat(cm[1]) : 0;
      results.push({
        date: m[1].trim(),
        weight,
        reps,
        volume: isNaN(volume) ? 0 : volume,
        rm: isNaN(rm) ? 0 : rm,
        calories: isNaN(calories) ? 0 : calories,
      });
    }
    return results.sort((a, b) => a.date.localeCompare(b.date));
  }

  // ─── Aggregation & Filtering ───────────────────────────────────────────────

  private aggregateMax(entries: ExerciseEntry[], field: "rm"): DayPoint[] {
    const map = new Map<string, number>();
    for (const e of entries) {
      map.set(e.date, Math.max(map.get(e.date) ?? -Infinity, e[field]));
    }
    return Array.from(map.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private aggregateSum(entries: ExerciseEntry[], field: "volume"): DayPoint[] {
    const map = new Map<string, number>();
    for (const e of entries) {
      map.set(e.date, (map.get(e.date) ?? 0) + e[field]);
    }
    return Array.from(map.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private filterByPeriod(points: DayPoint[], period: Period): DayPoint[] {
    if (period === "all") return points;
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 365;
    const cutoff = window.moment().subtract(days, "days").format("YYYY-MM-DD");
    return points.filter((p) => p.date >= cutoff);
  }

  // ─── Rendering ────────────────────────────────────────────────────────────

  private render(): void {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass("wl-dashboard");

    const i18n = t();
    // Header
    const header = root.createDiv({ cls: "wl-dashboard__header" });
    header.createEl("h2", { text: i18n.dashboardTitle });
    const refreshBtn = header.createEl("button", {
      cls: "wl-dashboard__refresh",
      text: i18n.dashboardRefresh,
    });
    refreshBtn.addEventListener("click", () => {
      void this.loadAll().then(() => this.render());
    });

    // Period tabs
    this.renderPeriodTabs(root);

    // Sections
    this.renderBodyMetricsSection(root);
    this.renderCaloriesSection(root);
    this.renderExerciseSection(root);
  }

  private renderPeriodTabs(container: HTMLElement): void {
    const i18n = t();
    const tabs: { label: string; value: Period }[] = [
      { label: i18n.periodWeek, value: "7d" },
      { label: i18n.periodMonth, value: "30d" },
      { label: i18n.periodYear, value: "365d" },
      { label: i18n.periodAll, value: "all" },
    ];
    const tabBar = container.createDiv({ cls: "wl-dashboard__tabs" });
    for (const tab of tabs) {
      const btn = tabBar.createEl("button", {
        cls: "wl-dashboard__tab" + (this.currentPeriod === tab.value ? " is-active" : ""),
        text: tab.label,
      });
      btn.addEventListener("click", () => {
        this.currentPeriod = tab.value;
        this.render();
      });
    }
  }

  private renderBodyMetricsSection(container: HTMLElement): void {
    const i18n = t();
    const section = container.createDiv({ cls: "wl-dashboard__section" });
    section.createEl("h3", { text: i18n.sectionBodyMetrics });

    if (this.bodyMetricsData.length === 0) {
      section.createDiv({
        cls: "wl-dashboard__empty",
        text: i18n.bodyMetricsEmpty,
      });
      return;
    }

    const weightPoints = this.filterByPeriod(
      this.bodyMetricsData.map((e) => ({ date: e.date, value: e.bodyWeight })),
      this.currentPeriod,
    );
    const fatPoints = this.filterByPeriod(
      this.bodyMetricsData
        .filter((e) => e.bodyFatPercentage > 0)
        .map((e) => ({ date: e.date, value: e.bodyFatPercentage })),
      this.currentPeriod,
    );

    const chartsRow = section.createDiv({ cls: "wl-dashboard__charts" });
    this.renderLineChart(chartsRow, weightPoints, i18n.chartWeight, "#4a9eff", "kg");
    if (fatPoints.length > 0) {
      this.renderLineChart(chartsRow, fatPoints, i18n.chartBodyFat, "#ff6b6b", "%");
    }
  }

  private renderCaloriesSection(container: HTMLElement): void {
    if (this.caloriesData.length === 0) return;

    const i18n = t();
    const section = container.createDiv({ cls: "wl-dashboard__section" });
    section.createEl("h3", { text: i18n.sectionCalories });

    const points = this.filterByPeriod(this.caloriesData, this.currentPeriod);
    const chartsRow = section.createDiv({ cls: "wl-dashboard__charts" });
    this.renderLineChart(chartsRow, points, i18n.chartCaloriesLabel, "#f59e0b", "kcal");
  }

  private renderExerciseSection(container: HTMLElement): void {
    const i18n = t();
    const section = container.createDiv({ cls: "wl-dashboard__section" });
    const sectionHeader = section.createDiv({ cls: "wl-dashboard__section-header" });
    sectionHeader.createEl("h3", { text: i18n.sectionExercise });

    if (this.exerciseNames.length === 0) {
      section.createDiv({
        cls: "wl-dashboard__empty",
        text: i18n.exerciseEmpty,
      });
      return;
    }

    const select = sectionHeader.createEl("select", {
      cls: "wl-dashboard__exercise-select",
    });
    for (const name of this.exerciseNames) {
      const opt = select.createEl("option", { value: name, text: name });
      if (name === this.selectedExercise) opt.selected = true;
    }

    const chartsArea = section.createDiv({ cls: "wl-dashboard__exercise-charts" });
    this.renderExerciseCharts(chartsArea);

    select.addEventListener("change", () => {
      this.selectedExercise = select.value;
      void this.loadExerciseData(this.selectedExercise).then((data) => {
        this.exerciseData = data;
        chartsArea.empty();
        this.renderExerciseCharts(chartsArea);
      });
    });
  }

  private renderExerciseCharts(container: HTMLElement): void {
    const i18n = t();
    if (!this.selectedExercise || this.exerciseData.length === 0) {
      container.createDiv({
        cls: "wl-dashboard__empty",
        text: i18n.exerciseDataEmpty,
      });
      return;
    }

    const rmPoints = this.filterByPeriod(
      this.aggregateMax(this.exerciseData, "rm"),
      this.currentPeriod,
    );
    const volPoints = this.filterByPeriod(
      this.aggregateSum(this.exerciseData, "volume"),
      this.currentPeriod,
    );

    const chartsRow = container.createDiv({ cls: "wl-dashboard__charts" });
    this.renderLineChart(chartsRow, rmPoints, i18n.chartEstimated1RM, "#a78bfa", "kg");
    this.renderLineChart(chartsRow, volPoints, i18n.chartTotalVolume, "#34d399", "kg");
  }

  // ─── SVG Line Chart ────────────────────────────────────────────────────────

  private renderLineChart(
    container: HTMLElement,
    points: DayPoint[],
    label: string,
    color: string,
    yUnit: string,
  ): void {
    const wrapper = container.createDiv({ cls: "wl-chart" });
    wrapper.createEl("p", { cls: "wl-chart__label", text: label });

    if (points.length === 0) {
      wrapper.createDiv({ cls: "wl-chart__empty", text: t().chartNoData });
      return;
    }

    const W = CHART_WIDTH;
    const H = CHART_HEIGHT;
    const P = CHART_PAD;
    const iW = W - P.left - P.right;
    const iH = H - P.top - P.bottom;

    const values = points.map((p) => p.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const spread = rawMax - rawMin || 1;
    const yMin = rawMin - spread * 0.08;
    const yMax = rawMax + spread * 0.08;

    const n = points.length;
    const xOf = (i: number): number =>
      n === 1 ? iW / 2 : (i / (n - 1)) * iW;
    const yOf = (v: number): number =>
      iH - ((v - yMin) / (yMax - yMin)) * iH;

    const svg = this.svgEl(wrapper, "svg", {
      viewBox: `0 0 ${W} ${H}`,
      class: "wl-chart__svg",
    }) as SVGSVGElement;

    const g = this.svgEl(svg, "g", {
      transform: `translate(${P.left},${P.top})`,
    });

    // Grid + Y labels
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const y = (i / gridCount) * iH;
      this.svgEl(g, "line", {
        x1: "0",
        y1: y.toFixed(1),
        x2: String(iW),
        y2: y.toFixed(1),
        class: "wl-chart__grid",
      });
      const val = yMax - (i / gridCount) * (yMax - yMin);
      const t = this.svgEl(g, "text", {
        x: "-6",
        y: y.toFixed(1),
        class: "wl-chart__axis-text",
        "dominant-baseline": "middle",
        "text-anchor": "end",
      });
      t.textContent = val.toFixed(1);
    }

    // Y-unit label (rotated)
    const yt = this.svgEl(g, "text", {
      x: "-38",
      y: (iH / 2).toFixed(1),
      class: "wl-chart__axis-unit",
      "text-anchor": "middle",
      transform: `rotate(-90,-38,${(iH / 2).toFixed(1)})`,
    });
    yt.textContent = yUnit;

    // Axes
    this.svgEl(g, "line", {
      x1: "0", y1: "0", x2: "0", y2: String(iH), class: "wl-chart__axis",
    });
    this.svgEl(g, "line", {
      x1: "0", y1: String(iH), x2: String(iW), y2: String(iH), class: "wl-chart__axis",
    });

    // X-axis labels (up to 6, evenly spaced)
    const maxLabels = 6;
    const step = Math.max(1, Math.ceil(n / maxLabels));
    for (let i = 0; i < n; i += step) {
      const xt = this.svgEl(g, "text", {
        x: xOf(i).toFixed(1),
        y: (iH + 14).toFixed(1),
        class: "wl-chart__axis-text",
        "text-anchor": "middle",
      });
      xt.textContent = points[i].date.substring(5).replace("-", "/");
    }

    // Area fill
    if (n > 1) {
      const areaD =
        `M${xOf(0).toFixed(1)},${iH} ` +
        points.map((p, i) => `L${xOf(i).toFixed(1)},${yOf(p.value).toFixed(1)}`).join(" ") +
        ` L${xOf(n - 1).toFixed(1)},${iH} Z`;
      this.svgEl(g, "path", {
        d: areaD,
        class: "wl-chart__area",
        fill: color,
      });
    }

    // Line
    if (n > 1) {
      const lineD = points
        .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(p.value).toFixed(1)}`)
        .join(" ");
      this.svgEl(g, "path", {
        d: lineD,
        class: "wl-chart__line",
        stroke: color,
        fill: "none",
      });
    }

    // Data points with tooltip
    for (let i = 0; i < n; i++) {
      const circle = this.svgEl(g, "circle", {
        cx: xOf(i).toFixed(1),
        cy: yOf(points[i].value).toFixed(1),
        r: "4",
        class: "wl-chart__dot",
        fill: color,
      });
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = `${points[i].date}: ${points[i].value.toFixed(1)} ${yUnit}`;
      circle.appendChild(title);
    }
  }

  private svgEl(
    parent: Element,
    tag: string,
    attrs: Record<string, string>,
  ): Element {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const k in attrs) {
      el.setAttribute(k, attrs[k]);
    }
    parent.appendChild(el);
    return el;
  }
}
