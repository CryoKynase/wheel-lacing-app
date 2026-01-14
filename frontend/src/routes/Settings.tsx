import { tableColumnLabels, type TableColumnVisibility } from "../lib/tableSettings";

type SettingsProps = {
  tableColumns: TableColumnVisibility;
  onTableColumnsChange: (next: TableColumnVisibility) => void;
};

const columnKeys = Object.keys(tableColumnLabels) as Array<
  keyof TableColumnVisibility
>;

export default function Settings({
  tableColumns,
  onTableColumnsChange,
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
