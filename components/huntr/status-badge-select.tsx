import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  type ApplicationStatus,
  applicationStatuses,
  prettyStatus,
} from "@/lib/applications";
import { statusItems } from "@/lib/select-options";
import { cn } from "@/lib/utils";

const statusBadgeClass: Record<ApplicationStatus, string> = {
  active: "bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-100",
  on_hold: "bg-zinc-200 text-zinc-800 dark:bg-zinc-500 dark:text-zinc-100",
  rejected: "bg-red-200 text-red-800 dark:bg-red-600 dark:text-red-100",
  withdrawn: "bg-violet-200 text-violet-800 dark:bg-violet-600 dark:text-violet-100",
  ghosted: "bg-red-300 text-red-800 dark:bg-red-950 dark:text-red-100",
  no_response: "bg-zinc-300 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-100",
  other: "bg-sky-200 text-sky-800 dark:bg-sky-600 dark:text-sky-100",
};

export function StatusBadgeSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
  ariaLabel: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as ApplicationStatus);
      }}
      items={statusItems}
    >
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className={cn(
          "h-5 min-h-5 min-w-0 border-0 px-2 py-0 shadow-none",
          "rounded-4xl text-xs font-medium hover:opacity-90",
          "focus-visible:ring-2 focus-visible:ring-ring/40 data-[size=sm]:h-5 data-[size=sm]:rounded-4xl",
          "[&_svg]:hidden dark:hover:opacity-90",
          statusBadgeClass[value],
        )}
      >
        {prettyStatus(value)}
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start">
        {applicationStatuses.map((status) => (
          <SelectItem value={status} key={status}>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  statusBadgeClass[status],
                )}
              />
              {prettyStatus(status)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
