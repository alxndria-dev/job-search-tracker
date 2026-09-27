import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { TableHead } from "@/components/ui/table";
import { type SortColumn, type SortState } from "@/lib/pipeline";

export function SortableHead({
  column,
  label,
  sort,
  onSort,
}: {
  column: SortColumn;
  label: string;
  sort: SortState;
  onSort: (column: SortColumn) => void;
}) {
  const active = sort?.column === column;
  const ariaSort = active
    ? sort.direction === "asc"
      ? "ascending"
      : "descending"
    : "none";
  return (
    <TableHead aria-sort={ariaSort}>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-md font-medium hover:text-foreground"
        onClick={() => onSort(column)}
      >
        {label}
        {active ? (
          sort.direction === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 opacity-40" />
        )}
        <span className="sr-only">
          {active
            ? `Sorted ${sort.direction === "asc" ? "ascending" : "descending"}. Click to ${sort.direction === "asc" ? "sort descending" : "clear sort"}.`
            : "Click to sort ascending."}
        </span>
      </button>
    </TableHead>
  );
}
