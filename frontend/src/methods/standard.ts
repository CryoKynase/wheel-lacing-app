import { holeOptions } from "../lib/holeOptions";
import type { LacingMethod, PatternResult, SpokePlacement } from "./types";

const tableColumns = [
  "Spoke",
  "Side",
  "Head",
  "Group",
  "Hub hole",
  "Rim hole",
  "Crosses",
];

type StandardParams = {
  crosses: number;
  startSide: "right" | "left";
  laceOrder: "headsOutFirst" | "headsInFirst";
  valveRule: "clearValve" | "alignKeySpokeRightOfValve";
};

const defaultParams: StandardParams = {
  crosses: 3,
  startSide: "right",
  laceOrder: "headsOutFirst",
  valveRule: "clearValve",
};

function resolveParams(params: Record<string, unknown>): StandardParams {
  const crosses =
    typeof params.crosses === "number"
      ? params.crosses
      : Number(params.crosses);
  return {
    crosses: Number.isFinite(crosses) ? crosses : defaultParams.crosses,
    startSide: params.startSide === "left" ? "left" : defaultParams.startSide,
    laceOrder:
      params.laceOrder === "headsInFirst" ? "headsInFirst" : defaultParams.laceOrder,
    valveRule:
      params.valveRule === "alignKeySpokeRightOfValve"
        ? "alignKeySpokeRightOfValve"
        : defaultParams.valveRule,
  };
}

function rotate<T>(values: T[], offset: number) {
  const length = values.length;
  if (length === 0) {
    return values;
  }
  const shift = ((offset % length) + length) % length;
  return values.slice(shift).concat(values.slice(0, shift));
}

function crossesLabel(crosses: number) {
  if (crosses === 0) {
    return "0x radial";
  }
  return `${crosses}x (over ${crosses - 1}, under 1)`;
}

function buildStandardPattern(holes: number, params: StandardParams) {
  if (!Number.isInteger(holes) || holes < 20 || holes % 2 !== 0) {
    throw new Error("holes must be even and >= 20");
  }
  const h = holes / 2;
  const rimAll = Array.from({ length: holes }, (_, idx) => idx + 1);
  const rimRight = rimAll.filter((hole) => hole % 2 === 1);
  const rimLeft = rimAll.filter((hole) => hole % 2 === 0);

  // TODO: refine valve alignment rules once hub/rim modeling is finalized.
  const rimOffset = params.valveRule === "alignKeySpokeRightOfValve" ? 1 : 0;
  const rimRightRot = rotate(rimRight, rimOffset);
  const rimLeftRot = rotate(rimLeft, rimOffset);

  const hubRight = Array.from({ length: h }, (_, idx) => idx + 1);
  const hubLeft = Array.from({ length: h }, (_, idx) => idx + 1);

  const splitEven = (values: number[]) => values.filter((_, idx) => idx % 2 === 0);
  const splitOdd = (values: number[]) => values.filter((_, idx) => idx % 2 === 1);

  const sideMap = params.startSide === "right"
    ? { start: "right", other: "left" }
    : { start: "left", other: "right" };

  const groupHead: Record<number, "in" | "out"> = {
    1: params.laceOrder === "headsInFirst" ? "in" : "out",
    2: params.laceOrder === "headsInFirst" ? "in" : "out",
    3: params.laceOrder === "headsInFirst" ? "out" : "in",
    4: params.laceOrder === "headsInFirst" ? "out" : "in",
  };

  const groupSide: Record<number, "right" | "left"> = {
    1: sideMap.start,
    2: sideMap.other,
    3: sideMap.start,
    4: sideMap.other,
  };

  const rimLists: Record<"right" | "left", { out: number[]; in: number[] }> = {
    right: { out: splitEven(rimRightRot), in: splitOdd(rimRightRot) },
    left: { out: splitEven(rimLeftRot), in: splitOdd(rimLeftRot) },
  };

  const hubLists: Record<"right" | "left", { out: number[]; in: number[] }> = {
    right: { out: splitEven(hubRight), in: splitOdd(hubRight) },
    left: { out: splitEven(hubLeft), in: splitOdd(hubLeft) },
  };

  const groupOrder = params.laceOrder === "headsInFirst"
    ? [3, 4, 1, 2]
    : [1, 2, 3, 4];

  const spokes: SpokePlacement[] = [];
  let spokeIndex = 1;

  for (const group of groupOrder) {
    const side = groupSide[group];
    const head = groupHead[group];
    const rimSequence = rimLists[side][head];
    const hubSequence = hubLists[side][head];
    const count = Math.min(rimSequence.length, hubSequence.length);

    for (let i = 0; i < count; i += 1) {
      spokes.push({
        spokeIndex,
        side,
        head,
        group: group as 1 | 2 | 3 | 4,
        hubHole: hubSequence[i],
        rimHole: rimSequence[i],
        crosses: params.crosses,
        // TODO: add leading/trailing classification once spoke direction is modeled.
      });
      spokeIndex += 1;
    }
  }

  return spokes;
}

export const standardMethod: LacingMethod = {
  id: "standard",
  name: "Standard (4-step / spoke groups)",
  shortDescription: "Four-group Park-style lacing sequence.",
  supportedHoles: [...holeOptions],
  params: [
    {
      key: "crosses",
      type: "select",
      label: "Crosses",
      default: String(defaultParams.crosses),
      options: [0, 1, 2, 3].map((value) => ({
        value: String(value),
        label: `${value}x`,
      })),
    },
    {
      key: "startSide",
      type: "select",
      label: "Start side",
      default: defaultParams.startSide,
      options: [
        { value: "right", label: "Right" },
        { value: "left", label: "Left" },
      ],
    },
    {
      key: "laceOrder",
      type: "select",
      label: "Lace order",
      default: defaultParams.laceOrder,
      options: [
        { value: "headsOutFirst", label: "Heads out first" },
        { value: "headsInFirst", label: "Heads in first" },
      ],
    },
    {
      key: "valveRule",
      type: "select",
      label: "Valve rule",
      default: defaultParams.valveRule,
      options: [
        { value: "clearValve", label: "Clear valve" },
        {
          value: "alignKeySpokeRightOfValve",
          label: "Align key spoke right of valve",
        },
      ],
    },
  ],
  supportsSteps: true,
  steps: [
    { id: "all", label: "All" },
    { id: "step1", label: "Step 1", groups: [1] },
    { id: "step2", label: "Step 2", groups: [2] },
    { id: "step3", label: "Step 3", groups: [3] },
    { id: "step4", label: "Step 4", groups: [4] },
  ],
  help: {
    title: "Standard (Park-style) method",
    sections: [
      {
        heading: "Overview",
        body:
          "The standard method groups spokes into four phases. Each phase places a consistent subset of spokes so the wheel stays organized as you lace.",
      },
      {
        heading: "Four-step flow",
        body:
          "Step 1 through Step 4 each correspond to a spoke group. The step filter will isolate those groups in the diagram and table once compute is enabled.",
      },
      {
        heading: "Coming soon",
        body:
          "Standard method calculations are in progress. The builder layout is ready, but spokes and tables will appear once the compute module is wired up.",
      },
    ],
  },
  compute: (holes, params): PatternResult => {
    const resolved = resolveParams(params);
    const spokes = buildStandardPattern(holes, resolved);
    const crossesText = crossesLabel(resolved.crosses);

    return {
      version: 1,
      methodId: "standard",
      holes,
      params: resolved,
      spokes,
      table: {
        columns: tableColumns,
        rows: spokes.map((spoke) => ({
          Spoke: `${spoke.side === "right" ? "R" : "L"}-${String(
            spoke.hubHole
          ).padStart(2, "0")}`,
          Side: spoke.side === "right" ? "Right" : "Left",
          Head: spoke.head === "out" ? "Out" : "In",
          Group: spoke.group,
          "Hub hole": spoke.hubHole,
          "Rim hole": spoke.rimHole,
          Crosses: crossesText,
        })),
      },
    };
  },
};
