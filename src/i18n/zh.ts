import type { Translations } from "./index";

const zh: Translations = {
  // Modal
  modalTitle: "🏋️‍♂️ 记录训练组",
  // Exercise
  exerciseLabel: "训练动作",
  exerciseDesc: "选择已有动作，或输入新名称以创建。",
  exercisePlaceholder: "例：卧推",
  // Target muscle
  targetMuscleLabel: "目标肌群",
  targetMuscleDesc: "选择本次训练的主要肌群。",
  targetMuscleOptions: ["胸", "背", "肩", "手臂", "腹", "腿", "有氧"],
  // Equipment
  equipmentLabel: "器械",
  equipmentDesc: "选择使用的器械。",
  equipmentTypeOptions: ["杠铃", "哑铃", "器械", "自重", "其他"],
  // Log date
  logDateLabel: "记录日期",
  logDateDesc: "选择本次训练的日期。",
  // Calorie inputs
  bodyWeightLabel: "体重 (kg)",
  bodyWeightDesc: "用于卡路里计算，与插件设置同步。",
  bodyFatLabel: "体脂率 (%)",
  bodyFatDesc: "当前体脂率，随记录保存并与插件设置同步。",
  workoutDurationLabel: "训练总时长 (分钟)",
  workoutDurationDesc: "本次训练的总时长，将平均分配到各组以计算每组消耗卡路里。",
  // Cardio
  cardioSectionLabel: "有氧运动",
  cardioSpeedLabel: "速度 (km/h)",
  cardioInclineLabel: "坡度 (%)",
  cardioDurationLabel: "时长 (分钟)",
  // Sets
  setWeight: (n) => `第 ${n} 组 - 重量 (kg/lbs)`,
  setReps: (n) => `第 ${n} 组 - 次数`,
  setRpe: (n) => `第 ${n} 组 - RPE`,
  addSet: "添加组",
  removeSet: "删除组",
  // Buttons
  cancel: "取消",
  logSet: "记录",
  // Notices
  noticeNoExercise: "⚠️ 请输入训练动作名称！",
  noticeNoValidSet: "⚠️ 请至少输入一组有效数据（重量和次数均大于0）！",
  noticeNoDuration: "⚠️ 请输入时长（分钟）！",
  noticeLoggedStrength: (summary, exercise) => `✅ 已记录 ${exercise}：${summary}`,
  noticeLoggedCardio: (duration, calories, exercise) =>
    `✅ 已记录 ${exercise} 的有氧运动：${duration}分钟 (${calories} kcal)`,
  noticeFailed: "❌ 记录失败，请查看控制台。",
  // Settings
  settingExerciseFolderName: "训练文件夹",
  settingExerciseFolderDesc: "存储训练笔记的文件夹路径。",
  settingCalcCaloriesName: "计算消耗卡路里",
  settingCalcCaloriesDesc: "基于METs、体重和训练时长计算消耗卡路里。",
  settingBodyWeightName: "默认体重 (kg)",
  settingBodyWeightDesc: "用于卡路里计算。",
  settingBodyFatName: "默认体脂率 (%)",
  settingBodyFatDesc: "随每条训练记录保存，用于追踪体成分变化。",
  settingBodyMetricsNoteName: "身体数据笔记",
  settingBodyMetricsNoteDesc: "每日记录体重和体脂率的笔记路径（启用卡路里计算时使用）。",
  // Dashboard
  dashboardTitle: "训练仪表盘",
  dashboardRefresh: "↻ 刷新",
  periodWeek: "本周",
  periodMonth: "本月",
  periodYear: "本年",
  periodAll: "全部",
  sectionBodyMetrics: "身体数据",
  bodyMetricsEmpty: "暂无数据。请开启卡路里计算并记录体重。",
  chartWeight: "体重",
  chartBodyFat: "体脂率",
  sectionCalories: "消耗卡路里",
  chartCaloriesLabel: "消耗卡路里（每日合计）",
  sectionExercise: "训练记录",
  exerciseEmpty: "暂无数据。请记录一次训练以开始。",
  exerciseDataEmpty: "该动作暂无数据。",
  chartEstimated1RM: "预估1RM",
  chartTotalVolume: "总训练量",
  chartNoData: "暂无数据",
};

export default zh;
