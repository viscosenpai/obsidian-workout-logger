import type { Translations } from "./index";

const en: Translations = {
  // Modal
  modalTitle: "🏋️‍♂️ Log Workout Set",
  // Exercise
  exerciseLabel: "Exercise",
  exerciseDesc: "Select an existing exercise or type a new one to create it.",
  exercisePlaceholder: "e.g. Bench Press",
  // Target muscle
  targetMuscleLabel: "Target Muscle",
  targetMuscleDesc: "Select the primary muscle group targeted.",
  // Equipment
  equipmentLabel: "Equipment",
  equipmentDesc: "Select the equipment used.",
  // Log date
  logDateLabel: "Log Date",
  logDateDesc: "Select the date for the workout log.",
  // Calorie inputs
  bodyWeightLabel: "Body Weight (kg)",
  bodyWeightDesc: "Used for calorie calculation. Syncs with plugin settings.",
  bodyFatLabel: "Body Fat Percentage (%)",
  bodyFatDesc: "Current body fat %. Logged with the entry and syncs with plugin settings.",
  workoutDurationLabel: "Total Exercise Duration (min)",
  workoutDurationDesc: "Total time for this exercise. Divided equally across sets to calculate calories per set.",
  // Cardio
  cardioSectionLabel: "Cardio",
  cardioSpeedLabel: "Speed (km/h)",
  cardioInclineLabel: "Incline (%)",
  cardioDurationLabel: "Duration (min)",
  // Sets
  setWeight: (n) => `Set ${n} - Weight (kg/lbs)`,
  setReps: (n) => `Set ${n} - Reps`,
  setRpe: (n) => `Set ${n} - RPE`,
  addSet: "Add Set",
  removeSet: "Remove Set",
  // Buttons
  cancel: "Cancel",
  logSet: "Log Set",
  // Notices
  noticeNoExercise: "⚠️ Please enter an exercise name!",
  noticeNoValidSet: "⚠️ Enter at least one valid set (weight and reps > 0)!",
  noticeNoDuration: "⚠️ Please enter a duration (minutes)!",
  noticeLoggedStrength: (summary, exercise) => `✅ Logged ${summary} for ${exercise}`,
  noticeLoggedCardio: (duration, calories, exercise) =>
    `✅ Logged ${duration}min cardio (${calories} kcal) for ${exercise}`,
  noticeFailed: "❌ Failed to log the set. Check console for details.",
  // Settings
  settingExerciseFolderName: "Exercise Folder",
  settingExerciseFolderDesc: "The folder where your exercise notes are stored.",
  settingCalcCaloriesName: "Calculate Calories Burned",
  settingCalcCaloriesDesc: "Calculate calories burned based on METs, body weight, and workout duration.",
  settingBodyWeightName: "Default Body Weight (kg)",
  settingBodyWeightDesc: "Used for calorie calculation.",
  settingBodyFatName: "Default Body Fat Percentage (%)",
  settingBodyFatDesc: "Logged alongside each workout entry to track body composition over time.",
  settingBodyMetricsNoteName: "Body Metrics Note",
  settingBodyMetricsNoteDesc: "Path to the note where daily body weight and body fat % are recorded (used when calorie calculation is enabled).",
  // Dashboard
  dashboardTitle: "Workout Dashboard",
  dashboardRefresh: "↻ Refresh",
  periodWeek: "Week",
  periodMonth: "Month",
  periodYear: "Year",
  periodAll: "All Time",
  sectionBodyMetrics: "Body Metrics",
  bodyMetricsEmpty: "No data found. Enable calorie calculation and log your body weight.",
  chartWeight: "Body Weight",
  chartBodyFat: "Body Fat %",
  sectionCalories: "Calories Burned",
  chartCaloriesLabel: "Calories Burned (daily total)",
  sectionExercise: "Exercise Log",
  exerciseEmpty: "No exercises found. Log a workout to get started.",
  exerciseDataEmpty: "No data for this exercise.",
  chartEstimated1RM: "Estimated 1RM",
  chartTotalVolume: "Total Volume",
  chartNoData: "No data",
};

export default en;
