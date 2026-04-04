/**
 * Calculate the total volume of a set.
 * @param weight The weight lifted.
 * @param reps The number of repetitions.
 * @returns The total volume.
 */
export function calculateVolume(weight: number, reps: number): number {
  return weight * reps;
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
  フリーウェイト: 6.0,
  ダンベル: 6.0,
  マシン: 5.0,
  自重: 3.8,
  その他: 5.0,
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
