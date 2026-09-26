import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * Tabs, in two shapes that do different jobs:
 *
 * - `segmented` — a pill sliding inside a recessed track. This is Cursor's
 *   `1d / 7d / 30d` control: a small, local switch between renderings of the
 *   same data. Keep it short; it does not scroll.
 * - `line` — an underline rail. This is a section-level switch between
 *   different content, and it sits directly on the page surface.
 *
 * Neither is a substitute for navigation. A tab that changes the URL and can
 * be linked to is a nav item; put it in the sidebar or the settings rail.
 */

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-3 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  [
    "group/tabs-list inline-flex w-fit items-center justify-center",
    "group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  ],
  {
    variants: {
      variant: {
        segmented:
          "h-control-lg gap-0.5 rounded-md bg-muted p-0.5 text-secondary-foreground",
        line: "h-control-lg w-full justify-start gap-4 rounded-none border-b border-border-subtle",
      },
    },
    defaultVariants: { variant: "segmented" },
  }
)

function TabsList({
  className,
  variant,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant ?? "segmented"}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
        "text-xs font-medium text-secondary-foreground select-none",
        "duration-fast transition-colors ease-out-strong",
        "hover:text-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",

        // segmented: the active tab is a raised pill on the recessed track
        "group-data-[variant=segmented]/tabs-list:h-control-md",
        "group-data-[variant=segmented]/tabs-list:flex-1",
        "group-data-[variant=segmented]/tabs-list:rounded-sm",
        "group-data-[variant=segmented]/tabs-list:px-2.5",
        "group-data-[variant=segmented]/tabs-list:data-selected:bg-background",
        "group-data-[variant=segmented]/tabs-list:data-selected:text-foreground",
        "group-data-[variant=segmented]/tabs-list:data-selected:shadow-sm",

        // line: a 2px rule under the active tab, overlapping the list's border
        "group-data-[variant=line]/tabs-list:h-full",
        "group-data-[variant=line]/tabs-list:rounded-none",
        "group-data-[variant=line]/tabs-list:data-selected:text-foreground",
        "group-data-[variant=line]/tabs-list:after:absolute",
        "group-data-[variant=line]/tabs-list:after:inset-x-0",
        "group-data-[variant=line]/tabs-list:after:-bottom-px",
        "group-data-[variant=line]/tabs-list:after:h-0.5",
        "group-data-[variant=line]/tabs-list:after:bg-foreground",
        "group-data-[variant=line]/tabs-list:after:opacity-0",
        "group-data-[variant=line]/tabs-list:after:transition-opacity",
        "group-data-[variant=line]/tabs-list:data-selected:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants }
