import type { Translations } from "./index";

const ko: Translations = {
  // Modal
  modalTitle: "🏋️‍♂️ 운동 세트 기록",
  // Exercise
  exerciseLabel: "운동",
  exerciseDesc: "기존 운동을 선택하거나 새 이름을 입력하여 생성하세요.",
  exercisePlaceholder: "예: 벤치 프레스",
  // Target muscle
  targetMuscleLabel: "목표 근육",
  targetMuscleDesc: "주요 목표 근육 그룹을 선택하세요.",
  // Equipment
  equipmentLabel: "기구",
  equipmentDesc: "사용하는 기구를 선택하세요.",
  // Log date
  logDateLabel: "기록 날짜",
  logDateDesc: "운동 기록 날짜를 선택하세요.",
  // Calorie inputs
  bodyWeightLabel: "체중 (kg)",
  bodyWeightDesc: "칼로리 계산에 사용됩니다. 플러그인 설정과 동기화됩니다.",
  bodyFatLabel: "체지방률 (%)",
  bodyFatDesc: "현재 체지방률. 기록과 함께 저장되며 플러그인 설정과 동기화됩니다.",
  workoutDurationLabel: "전체 운동 시간 (분)",
  workoutDurationDesc: "이 운동에 소요된 총 시간. 세트 수로 나누어 세트별 소모 칼로리를 계산합니다.",
  // Cardio
  cardioSectionLabel: "유산소 운동",
  cardioSpeedLabel: "속도 (km/h)",
  cardioInclineLabel: "경사 (%)",
  cardioDurationLabel: "시간 (분)",
  // Sets
  setWeight: (n) => `세트 ${n} - 무게 (kg/lbs)`,
  setReps: (n) => `세트 ${n} - 횟수`,
  setRpe: (n) => `세트 ${n} - RPE`,
  addSet: "세트 추가",
  removeSet: "세트 삭제",
  // Buttons
  cancel: "취소",
  logSet: "기록",
  // Notices
  noticeNoExercise: "⚠️ 운동 이름을 입력하세요!",
  noticeNoValidSet: "⚠️ 유효한 세트를 최소 하나 입력하세요 (무게와 횟수 모두 0보다 커야 합니다)!",
  noticeNoDuration: "⚠️ 시간(분)을 입력하세요!",
  noticeLoggedStrength: (summary, exercise) => `✅ ${exercise} 기록 완료: ${summary}`,
  noticeLoggedCardio: (duration, calories, exercise) =>
    `✅ ${exercise} 유산소 운동 기록 완료: ${duration}분 (${calories} kcal)`,
  noticeFailed: "❌ 기록에 실패했습니다. 콘솔을 확인하세요.",
  // Settings
  settingExerciseFolderName: "운동 폴더",
  settingExerciseFolderDesc: "운동 노트가 저장된 폴더 경로를 지정하세요.",
  settingCalcCaloriesName: "소모 칼로리 계산",
  settingCalcCaloriesDesc: "METs, 체중, 운동 시간을 기반으로 소모 칼로리를 계산합니다.",
  settingBodyWeightName: "기본 체중 (kg)",
  settingBodyWeightDesc: "칼로리 계산에 사용됩니다.",
  settingBodyFatName: "기본 체지방률 (%)",
  settingBodyFatDesc: "각 운동 기록과 함께 저장하여 체성분 변화를 추적합니다.",
  settingBodyMetricsNoteName: "신체 기록 노트",
  settingBodyMetricsNoteDesc: "체중과 체지방률을 일별로 기록하는 노트 경로 (칼로리 계산 활성화 시 사용).",
  // Dashboard
  dashboardTitle: "운동 대시보드",
  dashboardRefresh: "↻ 새로고침",
  periodWeek: "주간",
  periodMonth: "월간",
  periodYear: "연간",
  periodAll: "전체",
  sectionBodyMetrics: "신체 기록",
  bodyMetricsEmpty: "데이터가 없습니다. 칼로리 계산을 활성화하고 체중을 기록하세요.",
  chartWeight: "체중",
  chartBodyFat: "체지방률",
  sectionCalories: "소모 칼로리",
  chartCaloriesLabel: "소모 칼로리 (일별 합계)",
  sectionExercise: "운동 기록",
  exerciseEmpty: "데이터가 없습니다. 운동을 기록하세요.",
  exerciseDataEmpty: "이 운동의 데이터가 없습니다.",
  chartEstimated1RM: "추정 1RM",
  chartTotalVolume: "총 볼륨",
  chartNoData: "데이터 없음",
};

export default ko;
