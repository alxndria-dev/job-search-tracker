import { History, Pencil, Trash2 } from "lucide-react";

import { StatusBadgeSelect } from "@/components/huntr/status-badge-select";
import { SentimentSelect } from "@/components/huntr/sentiment-select";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  type Application,
  type ApplicationStatus,
  type CurrentStage,
  type Sentiment,
  currentStages,
  formatDayMonth,
  jobUrlHref,
  prettyStage,
  statusFromApplication,
} from "@/lib/applications";
import { fitItems, fitScores, stageItems } from "@/lib/select-options";

export function ApplicationRow({
  application: app,
  onEdit,
  onStageChange,
  onStatusChange,
  onFitChange,
  onSentimentChange,
  onTimeline,
  onDelete,
}: {
  application: Application;
  onEdit: () => void;
  onStageChange: (stage: CurrentStage) => void;
  onStatusChange: (status: ApplicationStatus) => void;
  onFitChange: (fit: number) => void;
  onSentimentChange: (sentiment: Sentiment) => void;
  onTimeline: () => void;
  onDelete: () => void;
}) {
  const href = jobUrlHref(app.jobUrl);
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
            <strong className="block">{app.company}</strong>
          </a>
        ) : (
          <strong className="block">{app.company}</strong>
        )}
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {app.role}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {formatDayMonth(app.appliedDate) || "—"}
      </TableCell>
      <TableCell>
        <Select
          value={app.currentStage}
          onValueChange={(value) => {
            if (value) onStageChange(value as CurrentStage);
          }}
          items={stageItems}
        >
          <SelectTrigger
            size="sm"
            aria-label={`Change current stage for ${app.company}`}
            className="min-w-36"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start">
            {currentStages.map((stage) => (
              <SelectItem value={stage} key={stage}>
                {prettyStage(stage)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <StatusBadgeSelect
          value={statusFromApplication(app)}
          ariaLabel={`Change state for ${app.company}`}
          onChange={onStatusChange}
        />
      </TableCell>
      <TableCell>
        <Select
          value={String(app.fit)}
          onValueChange={(value) => {
            if (value) onFitChange(Number(value));
          }}
          items={fitItems}
        >
          <SelectTrigger
            size="sm"
            aria-label={`Change fit score for ${app.company}`}
            className="min-w-14 tabular-nums"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start">
            {fitScores.map((score) => (
              <SelectItem value={score} key={score}>
                {score}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex justify-center">
          <SentimentSelect
            value={app.sentiment}
            size="sm"
            ariaLabel={`Change sentiment for ${app.company}`}
            onChange={onSentimentChange}
          />
        </div>
      </TableCell>
      <TableCell className="max-w-xs whitespace-normal">
        {app.nextAction || (
          <em className="text-muted-foreground">Not defined</em>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {formatDayMonth(app.followUpDate) || "—"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label={`Edit ${app.company}`}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onTimeline}
            aria-label={`View timeline for ${app.company}`}
          >
            <History />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Delete ${app.company}`}
          >
            <Trash2 />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
