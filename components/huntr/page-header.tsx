import { useRef } from "react";
import { Download, Plus, Upload } from "lucide-react";

import { ThemeToggle } from "@/components/huntr/theme-toggle";
import { Button } from "@/components/ui/button";

export function PageHeader({
  onExport,
  onImport,
  onAdd,
}: {
  onExport: () => void;
  onImport: (file: File) => void;
  onAdd: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
      <div>
        <p className="mb-1.5 font-mono text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          Job search, without the self-deception
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Huntr.</h1>
      </div>
      <div className="flex w-full flex-wrap gap-2.5 sm:w-auto">
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
        <ThemeToggle />
      </div>
    </header>
  );
}
