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
import { type Application } from "@/lib/applications";

export function ImportReplaceDialog({
  applications,
  onOpenChange,
  onConfirm,
}: {
  applications: Application[] | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={!!applications} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Replace current applications?</AlertDialogTitle>
          <AlertDialogDescription>
            {applications
              ? `This will replace the applications stored in this browser with ${applications.length} imported ${applications.length === 1 ? "record" : "records"}. This cannot be undone.`
              : ""}
          </AlertDialogDescription>
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
