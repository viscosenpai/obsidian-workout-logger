import type { Translations } from "./index";

const ja: Translations = {
  // Modal
  modalTitle: "トレーニングを記録",
  // Exercise
  exerciseLabel: "エクササイズ",
  exerciseDesc:
    "既存のエクササイズを選択するか、新しい名前を入力して作成します。",
  exercisePlaceholder: "例: ベンチプレス",
  // Target muscle
  targetMuscleLabel: "対象筋肉",
  targetMuscleDesc: "主に鍛える筋肉グループを選択してください。",
  targetMuscleOptions: ["胸", "背中", "肩", "腕", "腹", "足", "有酸素"],
  // Equipment
  equipmentLabel: "器具",
  equipmentDesc: "使用する器具を選択してください。",
  equipmentTypeOptions: ["バーベル", "ダンベル", "マシン", "自重", "その他"],
  // Log date
  logDateLabel: "記録日",
  logDateDesc: "トレーニングログの日付を選択してください。",
  // Calorie inputs
  bodyWeightLabel: "体重 (kg)",
  bodyWeightDesc: "カロリー計算に使用します。プラグイン設定と同期されます。",
  bodyFatLabel: "体脂肪率 (%)",
  bodyFatDesc:
    "現在の体脂肪率。エントリと一緒に記録され、プラグイン設定と同期されます。",
  workoutDurationLabel: "エクササイズ全体の時間 (分)",
  workoutDurationDesc:
    "このエクササイズにかけた合計時間。セット数で等分して各セットの消費カロリーを計算します。",
  // Cardio
  cardioSectionLabel: "有酸素運動",
  cardioSpeedLabel: "速度 (km/h)",
  cardioInclineLabel: "傾斜 (%)",
  cardioDurationLabel: "時間 (分)",
  // Sets
  setWeight: (n) => `セット ${n} - 重量 (kg/lbs)`,
  setReps: (n) => `セット ${n} - 回数`,
  setRpe: (n) => `セット ${n} - RPE`,
  addSet: "セットを追加",
  removeSet: "セットを削除",
  // Buttons
  cancel: "キャンセル",
  logSet: "記録する",
  // Notices
  noticeNoExercise: "エクササイズ名を入力してください！",
  noticeNoValidSet:
    "有効なセットを少なくとも1つ入力してください (重量と回数が0より大きい)！",
  noticeNoDuration: "時間（分）を入力してください！",
  noticeLoggedStrength: (summary, exercise) =>
    `${exercise} を記録しました: ${summary}`,
  noticeLoggedCardio: (duration, calories, exercise) =>
    `${exercise} の有酸素運動を記録しました: ${duration}分 (${calories} kcal)`,
  noticeFailed: "❌ 記録に失敗しました。コンソールを確認してください。",
  // Settings
  settingExerciseFolderName: "エクササイズフォルダ",
  settingExerciseFolderDesc:
    "エクササイズノートを保存するフォルダのパスを指定します。",
  settingCalcCaloriesName: "消費カロリーを計算する",
  settingCalcCaloriesDesc:
    "METs・体重・運動時間をもとに消費カロリーを計算します。",
  settingBodyWeightName: "デフォルト体重 (kg)",
  settingBodyWeightDesc: "カロリー計算に使用します。",
  settingBodyFatName: "デフォルト体脂肪率 (%)",
  settingBodyFatDesc:
    "各トレーニングエントリとともに記録し、体組成の変化を追跡します。",
  settingBodyMetricsNoteName: "身体記録ノート",
  settingBodyMetricsNoteDesc:
    "体重・体脂肪率を日次記録するノートのパス（カロリー計算オン時に使用）。",
  // Dashboard
  dashboardTitle: "ワークアウトダッシュボード",
  dashboardRefresh: "更新",
  periodWeek: "週間",
  periodMonth: "月間",
  periodYear: "年間",
  periodAll: "全期間",
  sectionBodyMetrics: "身体記録",
  bodyMetricsEmpty:
    "データがありません。カロリー計算をオンにして体重を記録してください。",
  chartWeight: "体重",
  chartBodyFat: "体脂肪率",
  sectionCalories: "消費カロリー",
  chartCaloriesLabel: "消費カロリー（日次合計）",
  sectionExercise: "エクササイズ記録",
  exerciseEmpty: "データがありません。トレーニングを記録してください。",
  exerciseDataEmpty: "このエクササイズのデータがありません。",
  chartEstimated1RM: "推定1RM",
  chartTotalVolume: "総ボリューム",
  chartCardioDuration: "運動時間 (分)",
  chartCardioDistance: "距離 (km)",
  chartNoData: "データなし",
};

export default ja;
