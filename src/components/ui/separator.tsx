import * as React from "react"

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = "", orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
        } bg-gray-200 ${className}`}
        {...props}
      />
    )
  }
)
Separator.displayName = "Separator"

export { Separator }