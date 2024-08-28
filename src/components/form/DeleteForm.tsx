import { FormEvent, ReactNode, useState } from "react"

import { Button } from "@/components/ui/shadcn/button"
import { Modal } from "@/components"
import { ModalProps } from "../ui/Modal"

export default function DeleteForm({
  action,
  children,
  ...props
}: {
  action: () => void
  children: ReactNode
} & ModalProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    action()
    setOpen(false)
  }

  return (
    <Modal {...props} open={open} onOpenChange={setOpen} trigger={children}>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <Button fullWidth variant={"destructive"}>
          نعم
        </Button>
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={() => setOpen(false)}
        >
          لا
        </Button>
      </form>
    </Modal>
  )
}
