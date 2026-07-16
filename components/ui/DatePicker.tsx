import * as React from "react"
import { Calendar } from "lucide-react"
import { Input, InputProps } from "./Input"
import { cn } from "@/lib/utils"

export interface DatePickerProps extends Omit<InputProps, "type"> {}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Input
          type="date"
          ref={ref}
          error={error}
          label={label}
          className={cn(
            "block w-full cursor-text select-none",
            "appearance-none",
            "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
            "[&::-webkit-calendar-picker-indicator]:opacity-50",
            "hover:[&::-webkit-calendar-picker-indicator]:opacity-100",
            "dark:[&::-webkit-calendar-picker-indicator]:invert",
            "transition-all duration-200",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
