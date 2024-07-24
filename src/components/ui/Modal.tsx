import { ReactElement } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./shadcn/dialog"
import { DialogProps } from "@radix-ui/react-dialog"

type ModalProps = {
  title?: String
  children: ReactElement
  redTitle?: boolean
  description?: String
  trigger?: ReactElement
} & DialogProps

export default function Modal({
  title,
  redTitle,
  description,
  children,
  trigger,
  ...props
}: ModalProps) {
  return (
    <Dialog {...props}>
      {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] max-h-[700px] card overflow-scroll mx-3 p-8">
        <DialogHeader>
          <DialogTitle className={`${redTitle && "text-destructive"} font-bold`}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-grey">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
