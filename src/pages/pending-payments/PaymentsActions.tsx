import { FormEvent, useState } from "react"

import { usePayment, useVisit } from "@/hooks"
import { Modal, Notification } from "@/components"
import { Button } from "@/components/ui/shadcn/button"

export default function PaymentsActions({
  visitId,
  totalAmount,
  name
}: {
  visitId: string
  totalAmount: number
  name: string
}) {
  const { updatePayment } = usePayment()
  const { closeOpenVisit } = useVisit()
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    updatePayment.mutate(
      {
        visit_id: visitId,
        amount: totalAmount,
        payment_type: "payment",
        category: "visits",
        name: name
      },
      {
        onSuccess: async () => {
          await closeOpenVisit.mutate(visitId)
          setOpen(false)
        }
      }
    )
  }

  return (
    <>
      <Modal
        title={"إنهاء المحاسبة"}
        description={"هل أنت متأكد أنه تم دفع الحساب"}
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button size="sm" variant="secondary">
            تم الدفع
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Button className="basis-full">نعم</Button>
          <Button
            variant="secondary"
            className="basis-full"
            type="button"
            onClick={() => setOpen(false)}
          >
            لا
          </Button>
        </form>
      </Modal>
      {updatePayment.isSuccess && <Notification message="تم حفظ المحاسبة بنجاح" />}
      {updatePayment.isError && <Notification message="حدث خطأ ما!" error />}
    </>
  )
}
