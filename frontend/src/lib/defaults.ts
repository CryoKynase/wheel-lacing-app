import type { PatternRequest } from "./types";

export const defaultPatternRequest: PatternRequest = {
  holes: 32,
  wheelType: "rear",
  crosses: 3,
  symmetry: "symmetrical",
  invertHeads: false,
  startRimHole: 1,
  valveReference: "right_of_valve",
  startHubHoleDS: 1,
  startHubHoleNDS: 1,
};
