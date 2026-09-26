import { cn } from "cn"

/** Multi-line text. Same border and focus language as <Input>. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 rounded-sm border border-input bg-panel-input px-2 py-1.5 text-xs text-foreground",
        "field-sizing-content min-h-16",
        "duration-fast transition-colors ease-out-strong",
        "placeholder:text-muted-foreground",
        "focus:border-border-strong",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
