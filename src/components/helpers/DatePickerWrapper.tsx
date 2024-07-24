import { ReactNode } from "react"
import { CalendarIcon } from "lucide-react"

import { Label } from "../ui/shadcn/label"
import { cn } from "@/lib/utils"

export type DatePickerProps = {
  label: string
  children: ReactNode
  className?: string
}
export default function DatePickerWrapper({
  label,
  children,
  className = ""
}: DatePickerProps) {
  return (
    <Label className="basis-full">
      {label}
      <div
        className={cn(
          "flex items-center justify-start gap-2 px-3 mt-1 border rounded-full h-11 border-input",
          className
        )}
      >
        <CalendarIcon className="w-4 h-4 opacity-50" />
        {children}
      </div>
    </Label>
  )
}
