import { tableColumnLabels, type TableColumnVisibility } from "../lib/tableSettings";
import {
  accentThemes,
  type AccentThemeId,
} from "../lib/theme";

type SettingsProps = {
  tableColumns: TableColumnVisibility;
  onTableColumnsChange: (next: TableColumnVisibility) => void;
  accentThemeId: AccentThemeId;
  onAccentThemeChange: (next: AccentThemeId) => void;
};

const columnKeys = Object.keys(tableColumnLabels) as Array<
  keyof TableColumnVisibility
>;

export default function Settings({
  tableColumns,
  onTableColumnsChange,
  accentThemeId,
  onAccentThemeChange,
}: SettingsProps) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Control which columns appear in the pattern tables.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="text-xs font-semibold uppercase text-slate-500">
          Accent color
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Pick a subtle accent for buttons, focus rings, and highlights.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {accentThemes.map((theme) => (
            <label
              key={theme.id}
              className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm ${
                accentThemeId === theme.id
                  ? "border-primary/40 bg-primary/5"
                  : "border-slate-200"
              }`}
            >
              <input
                type="radio"
                name="accent-theme"
                checked={accentThemeId === theme.id}
                onChange={() => onAccentThemeChange(theme.id)}
              />
              <span
                className="h-3 w-3 rounded-full border border-slate-300"
                style={{ backgroundColor: `hsl(${theme.tokens.primary})` }}
                aria-hidden="true"
              />
              <span className="flex flex-col">
                <span className="font-medium text-slate-700">
                  {theme.label}
                </span>
                <span className="text-xs text-slate-500">
                  {theme.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="text-xs font-semibold uppercase text-slate-500">
          Table columns
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {columnKeys.map((key) => (
            <label
              key={key}
              className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <span className="font-medium text-slate-700">
                {tableColumnLabels[key]}
              </span>
              <input
                type="checkbox"
                checked={tableColumns[key]}
                onChange={(event) => {
                  const nextValue = event.target.checked;
                  onTableColumnsChange({
                    ...tableColumns,
                    [key]: nextValue,
                  });
                }}
              />
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
