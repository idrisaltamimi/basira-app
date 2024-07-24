import { cn } from "@/lib/utils"
import { CheckCircleIcon } from "lucide-react"
import { MdOutlineError } from "react-icons/md"

type SuccessNotificationProps = {
  message: string
  error?: boolean
}

export default function Notification({
  message,
  error = false
}: SuccessNotificationProps) {
  return (
    <div
      className={cn(
        `fixed z-50 flex items-center p-6 px-10 transform bg-white border-r-4 ${
          error ? "border-destructive" : "border-success"
        } rounded-lg shadow-md`,
        "animate-popup"
      )}
    >
      <div className="ml-3 text-success">
        {error ? (
          <MdOutlineError className="w-6 h-6" />
        ) : (
          <CheckCircleIcon className="w-6 h-6" />
        )}
      </div>
      <div className="mr-auto text-sm font-medium">{message}</div>
    </div>
  )
}
