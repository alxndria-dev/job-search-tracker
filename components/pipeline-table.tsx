import { useRef } from "react";
import { Download, Plus, Search, Upload } from "lucide-react";

import { ApplicationRow } from "@/components/application-row";
import { SortableHead } from "@/components/sortable-head";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type Application,
  type ApplicationStatus,
  type CurrentStage,
  type Sentiment,
} from "@/lib/applications";
import { type SortColumn, type SortState } from "@/lib/pipeline";
import { actionFilterItems, stageFilterItems } from "@/lib/select-options";

export function PipelineTable({
  applications,
  query,
  onQueryChange,
  stageFilter,
  onStageFilterChange,
  actionFilter,
  onActionFilterChange,
  hideClosed,
  onHideClosedChange,
  sort,
  onSort,
  onEdit,
  onStageChange,
  onStatusChange,
  onFitChange,
  onSentimentChange,
  onTimeline,
  onDelete,
  onExport,
  onImport,
  onAdd,
}: {
  applications: Application[];
  query: string;
  onQueryChange: (query: string) => void;
  stageFilter: string;
  onStageFilterChange: (value: string) => void;
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
  hideClosed: boolean;
  onHideClosedChange: (checked: boolean) => void;
  sort: SortState;
  onSort: (column: SortColumn) => void;
  onEdit: (application: Application) => void;
  onStageChange: (id: string, stage: CurrentStage) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onFitChange: (id: string, fit: number) => void;
  onSentimentChange: (id: string, sentiment: Sentiment) => void;
  onTimeline: (id: string) => void;
  onDelete: (application: Application) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onAdd: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <Card className="mt-5" id="pipeline">
      <CardHeader className="gap-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <CardDescription className="font-mono text-[11px] tracking-[0.08em] uppercase">
              Pipeline
            </CardDescription>
            <CardTitle>Applications</CardTitle>
          </div>
          <div className="flex w-full flex-wrap gap-2.5 sm:w-auto sm:justify-end">
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Import applications JSON"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImport(file);
                event.target.value = "";
              }}
            />
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => fileInput.current?.click()}
            >
              <Upload />
              Import data
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={onExport}
            >
              <Download />
              Export data
            </Button>
            <Button className="flex-1 sm:flex-none" onClick={onAdd}>
              <Plus />
              Add application
            </Button>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2.5">
          <div className="relative min-w-0 flex-1 sm:min-w-52">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search company or role"
              aria-label="Search applications"
              className="pl-8"
            />
          </div>
          <Select
            value={stageFilter}
            onValueChange={(value) => {
              if (value) onStageFilterChange(value);
            }}
            items={stageFilterItems}
          >
            <SelectTrigger
              aria-label="Filter by current stage"
              className="min-w-40 flex-1 sm:flex-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(stageFilterItems).map(([value, label]) => (
                <SelectItem value={value} key={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={actionFilter}
            onValueChange={(value) => {
              if (value) onActionFilterChange(value);
            }}
            items={actionFilterItems}
          >
            <SelectTrigger
              aria-label="Filter by action state"
              className="min-w-40 flex-1 sm:flex-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(actionFilterItems).map(([value, label]) => (
                <SelectItem value={value} key={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 px-0.5">
            <Switch
              id="hide-closed"
              checked={hideClosed}
              onCheckedChange={onHideClosedChange}
              size="sm"
            />
            <Label htmlFor="hide-closed" className="text-sm font-normal">
              Hide closed
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table className="min-w-[920px]">
          <TableHeader>
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
                column="stage"
                label="Current stage"
                sort={sort}
                onSort={onSort}
              />
              <SortableHead
                column="state"
                label="State"
                sort={sort}
                onSort={onSort}
              />
              <SortableHead
                column="fit"
                label="Fit"
                sort={sort}
                onSort={onSort}
              />
              <TableHead className="text-center">Sentiment</TableHead>
              <TableHead>Next action</TableHead>
              <SortableHead
                column="followUp"
                label="Follow-up"
                sort={sort}
                onSort={onSort}
              />
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length ? (
              applications.map((app) => (
                <ApplicationRow
                  application={app}
                  key={app.id}
                  onEdit={() => onEdit(app)}
                  onStageChange={(stage) => onStageChange(app.id, stage)}
                  onStatusChange={(status) => onStatusChange(app.id, status)}
                  onFitChange={(fit) => onFitChange(app.id, fit)}
                  onSentimentChange={(sentiment) =>
                    onSentimentChange(app.id, sentiment)
                  }
                  onTimeline={() => onTimeline(app.id)}
                  onDelete={() => onDelete(app)}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-muted-foreground">
                  No applications match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
