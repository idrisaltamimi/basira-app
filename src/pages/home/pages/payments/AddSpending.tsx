import { ChangeEvent, FormEvent, useState } from "react"
import { FaAddressCard } from "react-icons/fa6"

import { Button } from "@/components/ui/shadcn/button"
import usePayment from "@/hooks/usePayment"
import { surrealDbId } from "@/lib/utils"
import { Modal, Notification, RadioInput, TextField } from "@/components"
import { useUser } from "@/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { Label } from "@/components/ui/shadcn/label"

const INITIAL_DATA: {
  amount: string
  payment_method: "كاش" | "فيزا"
  name: string
} = {
  amount: "",
  payment_method: "فيزا",
  name: ""
}

export default function AddSpending({
  setRefetch
}: {
  setRefetch: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const queryClient = useQueryClient()
  const { createNewPayment } = usePayment()
  const { userData } = useUser()

  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState(INITIAL_DATA)

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!parseInt(formData.amount)) return

    createNewPayment.mutate(
      {
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method as "فيزا" | "كاش",
        name: formData.name,
        payment_type: "spending",
        category: "expenses",
        pending: false,
        visit_id: surrealDbId(userData?.id)
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["get_paid_payments"] })
          setRefetch(true)
          setIsOpen(false)
        }
      }
    )
  }

  return (
    <>
      <Modal
        title={"أضف مصاريف"}
        description={"أضف مصاريف جديدة"}
        trigger={
          <Button size={"sm"} variant={"secondary"} className="flex items-center gap-2">
            أضف مصاريف
            <FaAddressCard />
          </Button>
        }
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        <form onSubmit={handleSubmit}>
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

          <TextField
            label="اسم المصروفات"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <TextField
            label="حساب المصاريف"
            name="amount"
            value={formData.amount}
            type="number"
            onChange={handleChange}
            required
          />

          <div className="flex gap-2 mt-6">
            <Button className="basis-full">أرسل</Button>
            <Button
              className="basis-full"
              type="button"
              variant={"secondary"}
              onClick={() => setIsOpen(false)}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>
      {createNewPayment.isSuccess && <Notification message="تم إضافة المصاريف بنجاح" />}
    </>
  )
}
