import { cn } from "@/lib/utils"
import { Input, InputProps } from "../ui/shadcn/input"
import { Label } from "../ui/shadcn/label"
import { ReactElement } from "react"

export type TextFieldProps = {
  label: string
  Icon?: ReactElement
  error?: boolean
  iconEnd?: boolean
} & InputProps &
  React.RefAttributes<HTMLInputElement>

export function TextField({
  label,
  name,
  Icon,
  error,
  className,
  iconEnd,
  required,
  ...props
}: TextFieldProps) {
  return (
    <Label htmlFor={name} className="w-full">
      {label}
      {required && "*"}
      <div
        className={cn(
          "flex items-center w-full mt-1 rounded-full bg-background border border-grey/30",
          error && "ring-red-500 ring-2"
        )}
      >
        {Icon && !iconEnd && Icon}
        <Input
          id={name}
          name={name}
          required={required}
          {...props}
          className={cn(
            "text-base w-full px-4 font-normal text-normal bg-transparent border-none focus-visible:outline-none ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary  mt-0",
            className
          )}
        />

        {Icon && iconEnd && Icon}
      </div>
    </Label>
  )
}
