import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function Field({
  name,
  label,
  value,
  type = "text",
  className,
  error,
  ...props
}: {
  name: string;
  label: string;
  value: string;
  type?: string;
  className?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  inputMode?: "url";
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={value}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  value,
  ...props
}: {
  name: string;
  label: string;
  value: string;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2 sm:col-span-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} defaultValue={value} rows={3} {...props} />
    </div>
  );
}
