export const holeOptions = [20, 24, 28, 32, 36] as const;

export type HoleOption = (typeof holeOptions)[number];

export function isHoleOption(value: number): value is HoleOption {
  return holeOptions.includes(value as HoleOption);
}
