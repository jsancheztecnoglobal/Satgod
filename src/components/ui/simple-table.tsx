import { cn } from "@/lib/cn";

export interface ColumnDef<TData> {
  key: keyof TData | string;
  header: string;
  render: (row: TData) => React.ReactNode;
  className?: string;
}

export function SimpleTable<TData>({
  columns,
  data,
  rowKey,
}: Readonly<{
  columns: ColumnDef<TData>[];
  data: TData[];
  rowKey: (row: TData) => string;
}>) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-4 align-top text-slate-700">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
