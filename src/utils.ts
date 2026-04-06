/**
 * Calculate the total volume of a set.
 * @param weight The weight lifted.
 * @param reps The number of repetitions.
 * @returns The total volume.
 */
export function calculateVolume(weight: number, reps: number): number {
  return Math.round(weight * reps);
}

/**
 * Calculate the 1 Rep Max (1RM) using the Epley formula.
 * Epley formula: 1RM = Weight * (1 + Reps / 30)
 * @param weight The weight lifted.
 * @param reps The number of repetitions.
 * @returns The estimated 1RM, rounded to 1 decimal place.
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 0) return 0;
  if (reps === 1) return weight;

  const oneRM = weight * (1 + reps / 30);
  return Math.round(oneRM * 10) / 10;
}

/**
 * Equipment types mapped to estimated METs values.
 */
export const EQUIPMENT_METS: Record<string, number> = {
  Barbell: 6.0,
  Dumbbell: 6.0,
  Machine: 5.0,
  Bodyweight: 3.8,
  Other: 5.0,
};

/**
 * Calculate calories burned.
 * Formula: METs * Weight(kg) * Duration(hours) * 1.05
 * @returns Estimated calories burned, rounded to nearest integer.
 */
export function calculateCalories(
  mets: number,
  weight: number,
  duration: number,
): number {
  return Math.round(mets * weight * duration * 1.05);
}

/**
 * Calculate calories burned for walking based on speed, incline, and duration.
 * Uses the formula: VO2 = 0.1 * v + 1.8 * v * g + 3.5
 * where v is speed in m/min and g is grade (incline) as a decimal.
 * Then converts VO2 to calories using: Calories = (VO2 * weight) / 1000 * 5 * duration
 * @param weight Body weight in kg
 * @param kph Speed in kilometers per hour
 * @param inclinePercent Incline as a percentage (e.g., 5 for 5%)
 * @param minutes Duration of the activity in minutes
 * @returns Estimated calories burned, rounded to nearest integer.
 */
export const calculateWalkingCalorie = (
  weight: number,
  kph: number,
  inclinePercent: number,
  minutes: number,
) => {
  const v = kph / 0.06;
  const g = inclinePercent / 100;
  const vo2 = 0.1 * v + 1.8 * v * g + 3.5;
  return ((vo2 * weight) / 1000) * 5 * minutes;
};
