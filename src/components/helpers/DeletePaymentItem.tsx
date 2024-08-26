import { FormEvent, ReactNode, useState } from "react"

import { Button } from "@/components/ui/shadcn/button"
import { usePayment } from "@/queries"
import { Modal } from "@/components"
import { surrealDbId } from "@/lib/utils"
import { SurrealDbId } from "@/lib/types"

export default function DeleteItemPayment({
  paymentId,
  paymentItemId,
  children
}: {
  paymentId: SurrealDbId
  paymentItemId: SurrealDbId
  children: ReactNode
}) {
  const { deletePaymentItem } = usePayment()

  const [open, setOpen] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    deletePaymentItem.mutate(
      { paymentId: surrealDbId(paymentId), paymentItemId: surrealDbId(paymentItemId) },
      {
        onSuccess: () => {
          setOpen(false)
        }
      }
    )
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