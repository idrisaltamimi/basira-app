import { FormEvent, ReactNode, useState } from "react"

import { Button } from "@/components/ui/shadcn/button"
import { usePayment } from "@/hooks"
import { Modal } from "@/components"
import { surrealDbId } from "@/lib/utils"
import { SurrealDbId } from "@/lib/types"

export default function DeletePayment({
  paymentId,
  children
}: {
  paymentId: SurrealDbId
  children: ReactNode
}) {
  const { deletePayment } = usePayment()

  const [open, setOpen] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    deletePayment.mutate(surrealDbId(paymentId), {
      onSuccess: () => {
        setOpen(false)
      }
    })
  }

  return (
    <Modal
      title={"إلغاء المحاسبة"}
      description={"هل أنت متأكد أنك تريد إلغاء المحاسبة"}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size={"icon"} variant={"ghost"} className="hover:text-destructive">
          {children}
        </Button>
      }
    >
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
