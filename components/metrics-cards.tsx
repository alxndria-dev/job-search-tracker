import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ActionFilter = "all" | "due" | "stale" | "none";

export function MetricsCards({
  activeCount,
  due,
  stale,
  noAction,
  hideClosed,
  query,
  stageFilter,
  actionFilter,
  onActiveOpportunities,
  onActionFilter,
}: {
  activeCount: number;
  due: number;
  stale: number;
  noAction: number;
  hideClosed: boolean;
  query: string;
  stageFilter: string;
  actionFilter: string;
  onActiveOpportunities: () => void;
  onActionFilter: (value: ActionFilter) => void;
}) {
  const cards = [
    {
      id: "active",
      number: activeCount,
      label: "Active opportunities",
      copy: "A pipeline is not progress unless it has a next move.",
      pressed:
        hideClosed &&
        actionFilter === "all" &&
        stageFilter === "all" &&
        query === "",
      onClick: onActiveOpportunities,
    },
    {
      id: "due",
      number: due,
      label: "Actions due now",
      copy: due
        ? "These can still change an outcome."
        : "Nothing urgent today.",
      pressed: actionFilter === "due",
      onClick: () => onActionFilter("due"),
    },
    {
      id: "stale",
      number: stale,
      label: "Likely cold",
      copy: stale
        ? "Stop counting silence as an active lead."
        : "No stale applications.",
      pressed: actionFilter === "stale",
      onClick: () => onActionFilter("stale"),
    },
    {
      id: "none",
      number: noAction,
      label: "No next action",
      copy: noAction
        ? "Decide: follow up, archive, or wait for a reason."
        : "Every active role has a move.",
      pressed: actionFilter === "none",
      onClick: () => onActionFilter("none"),
    },
  ] as const;

  return (
    <section className="mt-5 grid shrink-0 grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={card.onClick}
          aria-pressed={card.pressed}
          className="rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Card
            className={cn(
              "h-full cursor-pointer transition-shadow hover:ring-foreground/20",
              card.pressed && "ring-foreground/25",
            )}
          >
            <CardHeader>
              <CardDescription className="font-mono text-[11px] tracking-[0.08em] uppercase">
                {card.label}
              </CardDescription>
              <CardTitle className="text-4xl tracking-tight">
                {card.number}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.copy}</p>
            </CardContent>
          </Card>
        </button>
      ))}
    </section>
  );
}
