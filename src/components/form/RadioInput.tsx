import { Input, InputProps } from "../ui/shadcn/input"
import { Label } from "../ui/shadcn/label"
import { cn } from "@/lib/utils"

type RadioInput = {
  label: string
  small?: boolean
} & InputProps

export default function RadioInput({
  label,
  small,
  id,
  className,
  ...props
}: RadioInput) {
  return (
    <div className="relative radio-item">
      <Input
        id={id}
        type="radio"
        className={cn("absolute inset-0 opacity-0 pointer-events-none", className)}
        {...props}
      />
      <Label
        htmlFor={id}
        className={cn(
          "px-5 transition-colors border rounded-full cursor-pointer border-input",
          `transition ${small ? "py-1" : "py-2"}`
        )}
      >
        {label}
      </Label>
    </div>
  )
}
