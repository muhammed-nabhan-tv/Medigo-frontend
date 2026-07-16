"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input, InputProps } from "./Input"
import { cn } from "@/lib/utils"

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  forgotPasswordHref?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, label, forgotPasswordHref, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative w-full">
        <div className="flex justify-between items-center mb-1">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium text-slate-700 select-none dark:text-slate-300"
            >
              {label}
            </label>
          )}
          {forgotPasswordHref && (
            <a
              href={forgotPasswordHref}
              onClick={(e) => e.preventDefault()} // Dummy link for UI presentation
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              Forgot password?
            </a>
          )}
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            id={id}
            className={cn("pr-10", className)}
            error={error}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md p-1 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
