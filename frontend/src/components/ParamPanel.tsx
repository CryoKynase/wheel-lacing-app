import { useEffect, useMemo, useRef, useState } from "react";
import type { MethodParamDef } from "../methods/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/Button";

export type ParamPanelProps = {
  holes: number;
  params: Record<string, unknown>;
  paramDefs: MethodParamDef[];
  onParamsChange: (params: Record<string, unknown>) => void;
  valveStatus?: { status: "clear" | "crowded"; reason: string };
  sideFilter: "All" | "DS" | "NDS";
  onSideFilterChange: (next: "All" | "DS" | "NDS") => void;
};

function resolveDefault(def: MethodParamDef) {
  return def.default;
}

function buildDefaults(defs: MethodParamDef[]) {
  return defs.reduce<Record<string, unknown>>((acc, def) => {
    acc[def.key] = resolveDefault(def);
    return acc;
  }, {});
}

function shallowEqual(
  left: Record<string, unknown>,
  right: Record<string, unknown>
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  return leftKeys.every((key) => left[key] === right[key]);
}

export default function ParamPanel({
  holes,
  params,
  paramDefs,
  onParamsChange,
  valveStatus,
  sideFilter,
  onSideFilterChange,
}: ParamPanelProps) {
  const defaults = useMemo(() => buildDefaults(paramDefs), [paramDefs]);
  const [localParams, setLocalParams] = useState<Record<string, unknown>>(
    () => ({ ...defaults, ...params })
  );
  const syncingRef = useRef(false);

  useEffect(() => {
    syncingRef.current = true;
    setLocalParams({ ...defaults, ...params });
  }, [defaults, params]);

  useEffect(() => {
    if (syncingRef.current) {
      syncingRef.current = false;
      return;
    }
    if (shallowEqual(localParams, params)) {
      return;
    }
    onParamsChange(localParams);
  }, [localParams, onParamsChange, params]);

  const handleReset = () => {
    setLocalParams({ ...defaults });
  };

  const updateParam = (key: string, value: unknown) => {
    setLocalParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="space-y-4" data-param-panel>
      <Accordion type="multiple" className="w-full" defaultValue={["params"]}>
        <AccordionItem value="params">
          <AccordionTrigger>Parameters</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {paramDefs.map((def) => {
              if (def.type === "number") {
                const value = Number(localParams[def.key] ?? def.default);
                return (
                  <label key={def.key} className="block">
                    <span className="text-sm font-medium">{def.label}</span>
                    <input
                      type="number"
                      min={def.min}
                      max={def.max}
                      step={def.step ?? 1}
                      value={Number.isFinite(value) ? value : def.default}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        updateParam(def.key, Number.isFinite(next) ? next : def.default);
                      }}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    {def.helperText && (
                      <p className="mt-1 text-xs text-slate-500">
                        {def.helperText}
                      </p>
                    )}
                  </label>
                );
              }
              if (def.type === "select") {
                const value = String(localParams[def.key] ?? def.default);
                return (
                  <label key={def.key} className="block">
                    <span className="text-sm font-medium">{def.label}</span>
                    <select
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={value}
                      onChange={(event) => updateParam(def.key, event.target.value)}
                    >
                      {def.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {def.helperText && (
                      <p className="mt-1 text-xs text-slate-500">
                        {def.helperText}
                      </p>
                    )}
                  </label>
                );
              }
              const value = Boolean(localParams[def.key] ?? def.default);
              return (
                <label key={def.key} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{def.label}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(event) => updateParam(def.key, event.target.checked)}
                    className="h-4 w-4 accent-slate-700"
                  />
                </label>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="filters">
          <AccordionTrigger>Filters</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">DS/NDS</span>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={sideFilter}
                onChange={(event) =>
                  onSideFilterChange(event.target.value as "All" | "DS" | "NDS")
                }
              >
                <option value="All">All</option>
                <option value="DS">DS</option>
                <option value="NDS">NDS</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Filter the output by drive side or non-drive side.
              </p>
            </label>
            {valveStatus?.status === "clear" && (
              <div
                title={valveStatus.reason}
                className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
              >
                Valve area looks clear
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="quick-tips">
          <AccordionTrigger>Quick tips</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Keep spoke order consistent within each step.</li>
              <li>Use the step filter to verify groups one at a time.</li>
              <li>Double-check rim indexing near the valve.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="text-xs text-slate-500">Rim holes: {holes}</div>

      <Button type="button" variant="outline" onClick={handleReset} className="w-full">
        Reset defaults
      </Button>
    </section>
  );
}
