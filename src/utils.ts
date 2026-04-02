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
