import { FormEvent, useState } from "react"
import { MdPayments } from "react-icons/md"

import type { OpenVisits } from "@/lib/types"
import { surrealDbId } from "@/lib/utils"

import { usePayment } from "@/queries"
import { Button } from "@/components/ui/shadcn/button"
import { TextField, RadioInput, Modal, TooltipWrapper } from "@/components"
import { Label } from "@/components/ui/shadcn/label"

const initialPaymentForm: {
  name: string
  payment_type: "payment" | "spending"
  category: "visits" | "products" | "salaries" | "expenses"
  amount: string
  payment_method: "فيزا" | "كاش"
  pending: boolean
  visit_id: string
} = {
  name: "زيارة",
  payment_type: "payment",
  category: "visits",
  amount: "",
  payment_method: "فيزا",
  pending: true,
  visit_id: ""
}

export default function AddPayment({ visit }: { visit: OpenVisits }) {
  const [openDialog, setOpenDialog] = useState(false)
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm)
  const [selectedVisit, setSelectedVisit] = useState<OpenVisits>()

  const { createNewPayment } = usePayment()

  const handleChange = (e: React.ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setPaymentForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedVisit) return

    const data = {
      ...paymentForm,
      amount: parseFloat(paymentForm.amount),
      visit_id: surrealDbId(selectedVisit.id)
    }
    createNewPayment.mutate(data, {
      onSuccess: () => {
        setPaymentForm(initialPaymentForm)
        setOpenDialog(false)
      }
    })
  }

  return (
    <Modal
      title="المحاسبة"
      description={`إضافة دفعة جديدة لـ ${selectedVisit?.visitor_name}`}
      open={openDialog}
      onOpenChange={setOpenDialog}
      trigger={
        <TooltipWrapper content="أضف محاسبة">
          <Button
            className="w-full h-full hover:text-primary"
            variant={"ghost"}
            onClick={() => setSelectedVisit(visit)}
          >
            <MdPayments className="text-xl" />
          </Button>
        </TooltipWrapper>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <fieldset>
          <Label>اختر نوع الحساب</Label>
          <div className="flex items-center gap-2 mt-2">
            <RadioInput
              label="فتح زيارة"
              name="type"
              id="fee"
              value="زيارة"
              checked={paymentForm.name === "زيارة"}
              onChange={handleChange}
            />
            <RadioInput
              label="شراء منتجات"
              name="type"
              id="product"
              value="منتجات"
              checked={paymentForm.name === "منتجات"}
              onChange={handleChange}
            />
          </div>
        </fieldset>
        <div className="flex items-end gap-4">
          <TextField
            label={"الحساب"}
            name="amount"
            type="number"
            value={paymentForm.amount}
            onChange={handleChange}
          />
          <div className="pb-3 text-sm font-semibold opacity-80 whitespace-nowrap">
            ريال عماني
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" className="basis-full">
            أضف الحساب
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="basis-full"
            onClick={() => setOpenDialog(false)}
          >
            أغلق
          </Button>
        </div>
      </form>
    </Modal>
  )
}
