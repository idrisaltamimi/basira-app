import { ChangeEvent, FormEvent, useState } from "react"

import { usePayment, useVisit } from "@/hooks"
import { Modal, Notification, RadioInput, TextField } from "@/components"
import { Button } from "@/components/ui/shadcn/button"
import { Label } from "@/components/ui/shadcn/label"
import { formatCurrency } from "@/lib/utils"

type PaymentsActionsProps = {
  visitId: string
  totalAmount: number
  name: string
}

type PaymentForm = {
  payment_method: "فيزا" | "كاش"
  total?: number
  discount: string
}

const INITIAL_FORM: PaymentForm = {
  payment_method: "فيزا",
  discount: ""
}

export default function PaymentsActions({
  visitId,
  totalAmount,
  name
}: PaymentsActionsProps) {
  const [formData, setFormData] = useState(INITIAL_FORM)

  const { updatePayment } = usePayment()
  const { closeOpenVisit } = useVisit()
  const [open, setOpen] = useState(false)

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    updatePayment.mutate(
      {
        visit_id: visitId,
        amount:
          formData.discount === ""
            ? totalAmount
            : calculateNewTotal(totalAmount, parseInt(formData.discount)).newTotalValue,
        payment_type: "payment",
        category: "visits",
        name: name,
        payment_method: formData.payment_method
      },
      {
        onSuccess: async () => {
          await closeOpenVisit.mutate(visitId)
          setOpen(false)
        }
      }
    )
  }

  const calculateNewTotal = (total: number, discount: number) => {
    const discountAmount = total * (discount / 100)
    const newTotalValue = total - discountAmount
    return {
      newTotalValue: newTotalValue,
      discountAmount: discountAmount
    }
  }

  return (
    <>
      <Modal
        title={"إنهاء المحاسبة"}
        // description={"هل أنت متأكد أنه تم دفع الحساب"}
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button size="sm" variant="secondary">
            تم الدفع
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-4 mt-2">
            <Label>طريقة الدفع:</Label>
            <RadioInput
              label="فيزا"
              id="visa"
              name="payment_method"
              value="فيزا"
              checked={formData.payment_method === "فيزا"}
              onChange={handleChange}
            />
            <RadioInput
              label="كاش"
              id="cash"
              name="payment_method"
              value="كاش"
              checked={formData.payment_method === "كاش"}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-end gap-2">
            <TextField
              label="كوبون"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              type="number"
              className=" basis-full"
            />
            <p className="flex items-center font-bold basis-full h-11">%</p>
          </div>
          <hr className="mt-4 mb-0" />
          <div className="grid grid-cols-[120px_1fr] ">
            {formData.discount !== "" && (
              <>
                <p className="font-bold">التخفيض</p>
                <div>
                  {formatCurrency(
                    calculateNewTotal(totalAmount, parseInt(formData.discount))
                      .discountAmount
                  )}
                </div>
              </>
            )}
            <p className="font-bold">المجموع الكلي</p>
            <div>
              {formData.discount === ""
                ? formatCurrency(totalAmount)
                : formatCurrency(
                    calculateNewTotal(totalAmount, parseInt(formData.discount))
                      .newTotalValue
                  )}
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Button className="basis-full">نعم</Button>
            <Button
              variant="secondary"
              className="basis-full"
              type="button"
              onClick={() => setOpen(false)}
            >
              لا
            </Button>
          </div>
        </form>
      </Modal>
      {updatePayment.isSuccess && <Notification message="تم حفظ المحاسبة بنجاح" />}
      {updatePayment.isError && <Notification message="حدث خطأ ما!" error />}
    </>
  )
}
