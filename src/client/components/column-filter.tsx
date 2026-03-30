import type { MdEntryMeta } from "@md-meta-view/core";
import type { Column } from "@tanstack/react-table";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ColumnFilterProps {
  column: Column<MdEntryMeta>;
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function ColumnFilter({ column }: ColumnFilterProps) {
  const columnFilterValue = column.getFilterValue() as string | undefined;

  const uniqueValues = useMemo(() => {
    const values = new Set<string>();
    for (const row of column.getFacetedRowModel().rows) {
      const val = row.getValue(column.id);
      if (val === null || val === undefined) continue;
      if (Array.isArray(val)) {
        for (const v of val) values.add(String(v));
      } else {
        values.add(formatCellValue(val));
      }
    }
    return Array.from(values).sort();
  }, [column]);

  const isFewValues = uniqueValues.length <= 20;

  return (
    <fieldset
      className="space-y-2 border-0 p-0 m-0"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Input
        placeholder={`Filter ${column.id.replace("fm_", "")}...`}
        value={columnFilterValue ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className="h-7 text-xs"
      />
      {isFewValues && uniqueValues.length > 0 && (
        <div className="flex flex-wrap gap-1 max-h-32 overflow-auto">
          {uniqueValues.map((value) => {
            const isActive = columnFilterValue === value;
            return (
              <Badge
                key={value}
                variant={isActive ? "default" : "outline"}
                className="text-xs cursor-pointer hover:bg-primary/80"
                onClick={() => {
                  column.setFilterValue(isActive ? undefined : value);
                }}
              >
                {value || "(empty)"}
              </Badge>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
