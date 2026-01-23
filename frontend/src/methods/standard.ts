import { holeOptions } from "../lib/holeOptions";
import type { LacingMethod } from "./types";

export const standardMethod: LacingMethod = {
  id: "standard",
  name: "Standard",
  shortDescription: "Four-group Park-style lacing sequence.",
  supportedHoles: [...holeOptions],
  params: [],
  supportsSteps: true,
  steps: [
    { id: "all", label: "All spokes" },
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
  compute: () => {
    throw new Error("Standard method compute not implemented.");
  },
};
