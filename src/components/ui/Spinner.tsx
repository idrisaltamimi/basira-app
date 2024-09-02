import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { AiOutlineLoading3Quarters } from "react-icons/ai"

type SpinnerProps = {
  children?: ReactNode
  className?: string
}

export default function Spinner({ children, className = "" }: SpinnerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
      <AiOutlineLoading3Quarters className="animate-spin" />
    </div>
  )
}
