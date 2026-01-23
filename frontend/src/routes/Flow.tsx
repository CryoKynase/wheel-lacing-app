import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import ComputeStatus from "../components/ComputeStatus";
import FlowDiagram from "../components/FlowDiagram";
import ParamPanel from "../components/ParamPanel";
import Seo from "../components/Seo";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { defaultPatternRequest } from "../lib/defaults";
import { normalizeParamsForHoles } from "../lib/pattern";
import { getSeoMetadata } from "../lib/seo";
import { trackEvent } from "../lib/analytics";
import type { PatternRequest, PatternResponse, PatternRow } from "../lib/types";
import { getMethod, normalizeHolesForMethod, normalizeMethodId } from "../methods/registry";

const zoomLevels = [0.6, 0.8, 1, 1.2, 1.4, 1.6];

function defaultsForMethod(params: ReturnType<typeof getMethod>["params"]) {
  return params.reduce<Record<string, unknown>>((acc, def) => {
    acc[def.key] = def.default;
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

export default function Flow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { holes: holesParam, method: methodParam } = useParams();
  const methodId = normalizeMethodId(methodParam);
  const method = getMethod(methodId);
  const parsedHoles = Number(holesParam);
  const normalizedHoles = normalizeHolesForMethod(methodId, parsedHoles);
  const hasValidHolesParam = Number.isFinite(parsedHoles) && parsedHoles === normalizedHoles;
  const holes = hasValidHolesParam ? parsedHoles : normalizedHoles;

  const seo = useMemo(
    () => getSeoMetadata({ pathname: location.pathname, holes }),
    [location.pathname, holes]
  );

  const [data, setData] = useState<PatternResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [paramsByMethod, setParamsByMethod] = useState<Record<string, Record<string, unknown>>>(
    () => ({
      [methodId]: defaultsForMethod(method.params),
    })
  );
  const [sideFilter, setSideFilter] = useState<"All" | "DS" | "NDS">("All");
  const [zoomIndex, setZoomIndex] = useState(2);
  const svgRef = useRef<SVGSVGElement>(null);

  const zoom = zoomLevels[zoomIndex] ?? 1;

  const activeParams = useMemo(() => {
    const defaults = defaultsForMethod(method.params);
    return { ...defaults, ...(paramsByMethod[methodId] ?? {}) };
  }, [method.params, methodId, paramsByMethod]);

  const schranerParams = useMemo(() => {
    if (methodId !== "schraner") {
      return null;
    }
    const merged = {
      ...defaultPatternRequest,
      ...activeParams,
    } as PatternRequest;
    return normalizeParamsForHoles(merged, holes);
  }, [activeParams, holes, methodId]);

  const filteredRows = useMemo(() => {
    if (!data) {
      return [];
    }
    if (sideFilter === "All") {
      return data.rows;
    }
    return data.rows.filter((row) => row.side === sideFilter);
  }, [data, sideFilter]);

  const handleParamsChange = useCallback(
    async (params: Record<string, unknown>) => {
      const normalizedParams =
        methodId === "schraner"
          ? normalizeParamsForHoles(
              {
                ...defaultPatternRequest,
                ...params,
                holes,
              } as PatternRequest,
              holes
            )
          : params;
      setParamsByMethod((prev) => {
        const current = prev[methodId] ?? {};
        if (shallowEqual(current, normalizedParams as Record<string, unknown>)) {
          return prev;
        }
        return {
          ...prev,
          [methodId]: normalizedParams,
        };
      });
      if (methodId !== "schraner") {
        setData(null);
        setError(null);
        setLoading(false);
        setLastUpdated(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = method.compute(holes, normalizedParams);
        const rows = (result.table?.rows ?? []) as PatternRow[];
        setData({
          params: normalizedParams as PatternRequest,
          derived: { spokesPerSide: holes / 2 },
          rows,
        });
        setLastUpdated(new Date());
        const typed = normalizedParams as PatternRequest;
        trackEvent("pattern_generated", {
          holes: typed.holes,
          crosses: typed.crosses,
          wheel_type: typed.wheelType,
          symmetry: typed.symmetry,
          invert_heads: typed.invertHeads,
          view: "flow",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [holes, method, methodId]
  );

  useEffect(() => {
    if (methodParam && hasValidHolesParam) {
      return;
    }
    navigate(`/flow/${methodId}/${normalizedHoles}`, { replace: true });
  }, [hasValidHolesParam, methodId, methodParam, navigate, normalizedHoles]);

  useEffect(() => {
    if (!schranerParams) {
      return;
    }
    setParamsByMethod((prev) => ({
      ...prev,
      schraner: schranerParams,
    }));
  }, [schranerParams]);

  useEffect(() => {
    handleParamsChange(activeParams);
  }, [activeParams, handleParamsChange, holes, methodId]);

  const handleOpenPrintView = useCallback(() => {
    const svg = svgRef.current?.outerHTML;
    if (!svg) {
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      return;
    }
    printWindow.opener = null;
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Wheel Weaver Flow</title>
    <style>
      :root { color-scheme: light; }
      body { margin: 0; background: #fff; font-family: "Segoe UI", system-ui, sans-serif; }
      .page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12mm;
        box-sizing: border-box;
      }
      .flow-wrap {
        width: min(1200px, 100%);
        margin: 0 auto;
      }
      svg { width: 100% !important; height: auto !important; display: block; }
      @media print {
        @page { size: auto; margin: 12mm; }
        body { margin: 0; }
        .page { padding: 0; min-height: auto; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="flow-wrap">
        ${svg}
      </div>
    </div>
  </body>
</html>`;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    if (schranerParams) {
      trackEvent("flow_print_view", {
        holes: schranerParams.holes,
        crosses: schranerParams.crosses,
        wheel_type: schranerParams.wheelType,
      });
    }
  }, [schranerParams]);

  const handleDownloadSvg = useCallback(() => {
    const svg = svgRef.current?.outerHTML;
    if (!svg) {
      return;
    }
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wheel-lacing-flow.svg";
    link.click();
    URL.revokeObjectURL(url);
    if (schranerParams) {
      trackEvent("flow_download_svg", {
        holes: schranerParams.holes,
        crosses: schranerParams.crosses,
        wheel_type: schranerParams.wheelType,
      });
    }
  }, [schranerParams]);

  const paramSummary = useMemo(() => {
    if (!schranerParams) {
      return `${holes}H - ${method.name}`;
    }
    return `${schranerParams.holes}H - ${schranerParams.wheelType} - ${
      schranerParams.crosses
    }x - ${schranerParams.symmetry} - ${
      schranerParams.invertHeads ? "invert heads" : "default heads"
    }`;
  }, [holes, method.name, schranerParams]);

  return (
    <>
      <Seo {...seo} />
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Flow</h1>
            <p className="text-sm text-slate-600">
              Step-by-step flowchart for lacing from the valve reference point.
            </p>
          </div>
          <div className="text-xs text-slate-500">{paramSummary}</div>
        </div>

        <div className="space-y-6 lg:grid lg:grid-cols-[380px_1fr] lg:gap-6 lg:space-y-0">
          <aside className="space-y-4">
            <div className="space-y-3 lg:hidden">
              <Card>
                <details className="group">
                  <summary className="cursor-pointer px-4 pb-3 pt-4 text-sm font-semibold text-slate-900">
                    Parameters
                  </summary>
                  <div className="px-4 pb-4">
                    <ParamPanel
                      holes={holes}
                      params={activeParams}
                      paramDefs={method.params}
                      onParamsChange={handleParamsChange}
                      sideFilter={sideFilter}
                      onSideFilterChange={setSideFilter}
                    />
                  </div>
                </details>
              </Card>
            </div>
            <div className="hidden space-y-4 lg:block lg:sticky lg:top-20">
              <Card>
                <CardContent className="pt-4">
                  <ParamPanel
                    holes={holes}
                    params={activeParams}
                    paramDefs={method.params}
                    onParamsChange={handleParamsChange}
                    sideFilter={sideFilter}
                    onSideFilterChange={setSideFilter}
                  />
                </CardContent>
              </Card>
            </div>
          </aside>

          <div className="space-y-4">
            <ComputeStatus
              loading={loading}
              error={error}
              rowCount={data?.rows.length ?? null}
              lastUpdated={lastUpdated}
              onRetry={() => handleParamsChange(activeParams)}
            />

            {methodId !== "schraner" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Flow not available yet</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  This flowchart is only available for the Schraner method.
                </CardContent>
              </Card>
            ) : data ? (
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <FlowDiagram
                    params={schranerParams as PatternRequest}
                    rows={filteredRows}
                    svgRef={svgRef}
                    zoom={zoom}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                      Zoom
                      <div className="inline-flex rounded-md border border-slate-200 bg-white">
                        {zoomLevels.map((value, index) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setZoomIndex(index)}
                            className={`px-2 py-1 text-xs font-medium ${
                              zoomIndex === index
                                ? "bg-primary/10 text-foreground"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {value}x
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOpenPrintView}
                      >
                        Print view
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadSvg}
                      >
                        Download SVG
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                Pick your wheel basics to generate a flowchart.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
