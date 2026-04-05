import en from "./en";
import ja from "./ja";
import zh from "./zh";
import ko from "./ko";

export interface Translations {
  // Modal
  modalTitle: string;
  // Exercise
  exerciseLabel: string;
  exerciseDesc: string;
  exercisePlaceholder: string;
  // Target muscle
  targetMuscleLabel: string;
  targetMuscleDesc: string;
  // Equipment
  equipmentLabel: string;
  equipmentDesc: string;
  // Log date
  logDateLabel: string;
  logDateDesc: string;
  // Calorie inputs
  bodyWeightLabel: string;
  bodyWeightDesc: string;
  bodyFatLabel: string;
  bodyFatDesc: string;
  workoutDurationLabel: string;
  workoutDurationDesc: string;
  // Cardio
  cardioSectionLabel: string;
  cardioSpeedLabel: string;
  cardioInclineLabel: string;
  cardioDurationLabel: string;
  // Sets
  setWeight: (n: number) => string;
  setReps: (n: number) => string;
  setRpe: (n: number) => string;
  addSet: string;
  removeSet: string;
  // Buttons
  cancel: string;
  logSet: string;
  // Notices
  noticeNoExercise: string;
  noticeNoValidSet: string;
  noticeNoDuration: string;
  noticeLoggedStrength: (summary: string, exercise: string) => string;
  noticeLoggedCardio: (duration: number, calories: number, exercise: string) => string;
  noticeFailed: string;
  // Settings
  settingExerciseFolderName: string;
  settingExerciseFolderDesc: string;
  settingCalcCaloriesName: string;
  settingCalcCaloriesDesc: string;
  settingBodyWeightName: string;
  settingBodyWeightDesc: string;
  settingBodyFatName: string;
  settingBodyFatDesc: string;
  settingBodyMetricsNoteName: string;
  settingBodyMetricsNoteDesc: string;
  // Dashboard
  dashboardTitle: string;
  dashboardRefresh: string;
  periodWeek: string;
  periodMonth: string;
  periodYear: string;
  periodAll: string;
  sectionBodyMetrics: string;
  bodyMetricsEmpty: string;
  chartWeight: string;
  chartBodyFat: string;
  sectionCalories: string;
  chartCaloriesLabel: string;
  sectionExercise: string;
  exerciseEmpty: string;
  exerciseDataEmpty: string;
  chartEstimated1RM: string;
  chartTotalVolume: string;
  chartNoData: string;
}

const locales: Record<string, Translations> = { en, ja, zh, ko };

function detect(): string {
  const lang = window.localStorage.getItem("language") ?? "en";
  // Match zh variants → zh, others exact or fallback to en
  if (lang.startsWith("zh")) return "zh";
  return locales[lang] ? lang : "en";
}

export function t(): Translations {
  return locales[detect()];
}
