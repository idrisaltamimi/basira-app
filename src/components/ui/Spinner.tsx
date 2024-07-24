import { ReactNode } from "react"
import { AiOutlineLoading3Quarters } from "react-icons/ai"

export default function Spinner({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {children}
      <AiOutlineLoading3Quarters className="animate-spin" />
    </div>
  )
}
