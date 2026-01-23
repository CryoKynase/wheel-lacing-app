export type TableColumnVisibility = {
  order: boolean;
  step: boolean;
  side: boolean;
  oddEvenSet: boolean;
  k: boolean;
  group: boolean;
  notes: boolean;
};

export const defaultTableColumnVisibility: TableColumnVisibility = {
  order: true,
  step: true,
  side: true,
  oddEvenSet: true,
  k: true,
  group: true,
  notes: true,
};

export const tableColumnLabels: Record<keyof TableColumnVisibility, string> = {
  order: "Order",
  step: "Step",
  side: "Side",
  oddEvenSet: "Odd/Even set",
  k: "K",
  group: "Group",
  notes: "Notes",
};
