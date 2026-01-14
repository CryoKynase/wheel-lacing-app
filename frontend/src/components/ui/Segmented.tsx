import type { ReactNode } from "react";
import { LayoutGrid, LayoutList, SquareSplitHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";

const options = [
  { value: "table", label: "Table", Icon: LayoutList },
  { value: "diagram", label: "Diagram", Icon: LayoutGrid },
  { value: "both", label: "Both", Icon: SquareSplitHorizontal },
] as const;

export type SegmentedValue = (typeof options)[number]["value"];

export type SegmentedProps = {
  value: SegmentedValue;
  onChange: (value: SegmentedValue) => void;
  showIcons?: boolean;
  className?: string;
  label?: ReactNode;
};

export default function Segmented({
  value,
  onChange,
  showIcons = true,
  className = "",
  label,
}: SegmentedProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      )}
      <div className="inline-flex rounded-md border border-border bg-background p-1">
        {options.map(({ value: option, label: optionLabel, Icon }) => {
          const active = option === value;
          return (
            <Button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              variant="ghost"
              size="sm"
              className={`inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              }`}
            >
              {showIcons && <Icon className="h-3.5 w-3.5" />}
              {optionLabel}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
