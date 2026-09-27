import { ThemeToggle } from "@/components/theme-toggle";

export function PageHeader() {
  return (
    <header className="flex shrink-0 items-center justify-between gap-6">
      <div>
        <p className="mb-1.5 font-mono text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          Job search, without the self-deception
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">JobTrackr.</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
