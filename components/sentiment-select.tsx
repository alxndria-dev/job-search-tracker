import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { type Sentiment, prettySentiment, sentiments } from "@/lib/applications";
import { sentimentItems } from "@/lib/select-options";
import { cn } from "@/lib/utils";

const sentimentDotClass: Record<Sentiment, string> = {
  good: "bg-lime-400",
  neutral: "bg-orange-400",
  bad: "bg-red-400",
};

export function SentimentSelect({
  value,
  onChange,
  size = "default",
  id,
  className,
  ariaLabel,
}: {
  value: Sentiment;
  onChange: (sentiment: Sentiment) => void;
  size?: "sm" | "default";
  id?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as Sentiment);
      }}
      items={sentimentItems}
    >
      <SelectTrigger
        id={id}
        size={size}
        aria-label={ariaLabel ?? prettySentiment(value)}
        className={cn(
          "h-auto min-h-0 min-w-0 border-0 bg-transparent p-1 shadow-none hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent",
          "mx-auto focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-ring/40 data-[size=sm]:h-auto",
          "[&_svg]:hidden",
          className,
        )}
      >
        <span
          aria-hidden
          className={cn("size-4 rounded-full", sentimentDotClass[value])}
        />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start">
        {sentiments.map((sentiment) => (
          <SelectItem value={sentiment} key={sentiment}>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  sentimentDotClass[sentiment],
                )}
              />
              {prettySentiment(sentiment)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
