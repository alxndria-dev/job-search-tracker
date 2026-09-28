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
    <section className="mt-5 grid shrink-0 grid-cols-4 gap-2 xl:gap-3.5">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={card.onClick}
          aria-pressed={card.pressed}
          className="min-w-0 rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Card
            className={cn(
              "h-full cursor-pointer [--card-spacing:--spacing(2)] transition-shadow hover:ring-foreground/20 xl:[--card-spacing:--spacing(4)]",
              card.pressed && "ring-foreground/25",
            )}
          >
            <CardHeader className="gap-1 max-xl:min-h-16 max-xl:flex-1 max-xl:[grid-template-rows:auto_1fr]">
              <CardDescription className="font-mono text-[9px] leading-tight tracking-[0.06em] uppercase md:text-[11px] md:tracking-[0.08em]">
                {card.label}
              </CardDescription>
              <CardTitle className="text-2xl tracking-tight max-xl:self-end md:text-3xl xl:text-4xl">
                {card.number}
              </CardTitle>
            </CardHeader>
            <CardContent className="hidden xl:block">
              <p className="text-sm text-muted-foreground">{card.copy}</p>
            </CardContent>
          </Card>
        </button>
      ))}
    </section>
  );
}
