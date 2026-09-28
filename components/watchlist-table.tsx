import { Plus, Search } from "lucide-react";

import { PipelinePanel, type PipelineView } from "@/components/pipeline-tabs";
import { SortableHead } from "@/components/sortable-head";
import { WatchlistRow } from "@/components/watchlist-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type SortColumn, type SortState } from "@/lib/pipeline";
import { type WatchlistItem } from "@/lib/watchlist";

export function WatchlistTable({
  items,
  query,
  onQueryChange,
  sort,
  onSort,
  view,
  onViewChange,
  onAdd,
  onApplied,
  onEdit,
  onFitChange,
  onDelete,
}: {
  items: WatchlistItem[];
  query: string;
  onQueryChange: (query: string) => void;
  sort: SortState;
  onSort: (column: SortColumn) => void;
  view: PipelineView;
  onViewChange: (view: PipelineView) => void;
  onAdd: () => void;
  onApplied: (item: WatchlistItem) => void;
  onEdit: (item: WatchlistItem) => void;
  onFitChange: (item: WatchlistItem, fit: number) => void;
  onDelete: (item: WatchlistItem) => void;
}) {
  return (
    <PipelinePanel
      view={view}
      onViewChange={onViewChange}
      toolbar={
        <Button className="flex-1 md:flex-none" onClick={onAdd}>
          <Plus />
          Add to watchlist
        </Button>
      }
      filters={
        <div className="relative w-full min-w-0 md:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search company or role"
            aria-label="Search watchlist"
            className="pl-8"
          />
        </div>
      }
    >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <SortableHead
                column="opportunity"
                label="Opportunity"
                sort={sort}
                onSort={onSort}
              />
              <SortableHead
                column="added"
                label="Date added"
                sort={sort}
                onSort={onSort}
              />
              <SortableHead
                column="fit"
                label="Fit"
                sort={sort}
                onSort={onSort}
              />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? (
              items.map((item) => (
                <WatchlistRow
                  item={item}
                  key={item.id}
                  onApplied={() => onApplied(item)}
                  onEdit={() => onEdit(item)}
                  onFitChange={(fit) => onFitChange(item, fit)}
                  onDelete={() => onDelete(item)}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No watchlist items match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
    </PipelinePanel>
  );
}
