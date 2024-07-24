import { ReactElement } from "react"
import {
  Tooltip as TooltipW,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./shadcn/tooltip"

type TooltipProps = {
  children: ReactElement
  content: string
}

export default function TooltipWrapper({ content, children }: TooltipProps) {
  return (
    <TooltipProvider>
      <TooltipW>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </TooltipW>
    </TooltipProvider>
  )
}
