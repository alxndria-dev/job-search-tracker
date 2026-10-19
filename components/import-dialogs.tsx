import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ImportReplaceDialog({
  records,
  kind,
  onOpenChange,
  onConfirm,
}: {
  records: { length: number } | null;
  kind: "applications" | "watchlist";
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const count = records?.length ?? 0;
  const title =
    kind === "watchlist"
      ? "Replace current watchlist?"
      : "Replace current applications?";
  const description = records
    ? kind === "watchlist"
      ? `This will replace the watchlist stored in this browser with ${count} imported ${count === 1 ? "item" : "items"}. This cannot be undone.`
      : `This will replace the applications stored in this browser with ${count} imported ${count === 1 ? "record" : "records"}. This cannot be undone.`
    : "";
  return (
    <AlertDialog open={!!records} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Replace data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ImportErrorDialog({
  message,
  onOpenChange,
}: {
  message: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={!!message} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Could not import data</AlertDialogTitle>
          <AlertDialogDescription>{message ?? ""}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
