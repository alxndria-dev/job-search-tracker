import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDayMonth } from "@/lib/applications";
import { type WatchlistItem, watchlistHref } from "@/lib/watchlist";

export function WatchlistRow({
  item,
  onApplied,
  onEdit,
  onDelete,
}: {
  item: WatchlistItem;
  onApplied: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const href = watchlistHref(item.jobUrl);
  return (
    <TableRow>
      <TableCell>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            <strong className="block">{item.company}</strong>
          </a>
        ) : (
          <strong className="block">{item.company}</strong>
        )}
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {item.role || "Role not set"}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {formatDayMonth(item.addedDate) || "—"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onApplied}
            aria-label={`Mark ${item.company} as applied`}
          >
            Applied
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label={`Edit ${item.company}`}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Delete ${item.company}`}
          >
            <Trash2 />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
