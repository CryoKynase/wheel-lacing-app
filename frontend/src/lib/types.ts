export type PatternRequest = {
  holes: number;
  wheelType: "rear" | "front";
  crosses: number;
  symmetry: "symmetrical" | "asymmetrical";
  invertHeads: boolean;
  startRimHole: number;
  valveReference: "right_of_valve" | "left_of_valve";
  startHubHoleDS: number;
  startHubHoleNDS: number;
};

export type PatternRow = {
  spoke: string;
  order: number;
  step: string;
  side: "DS" | "NDS";
  oddEvenSet: "Odd" | "Even";
  k: number;
  hubHole: number;
  heads: "IN" | "OUT";
  rimHole: number;
  crossesDescribed: string;
  notes: string;
};

export type PatternResponse = {
  params: PatternRequest;
  derived: Record<string, number>;
  rows: PatternRow[];
};
