import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { FaX } from "react-icons/fa6"

import { Button } from "@/components/ui/shadcn/button"
import usePayment from "@/queries/usePayment"
import { formatCurrency, surrealDbId } from "@/lib/utils"
import { Modal, RadioInput, TextField } from "@/components"
import { useUser } from "@/queries"
import { useQueryClient } from "@tanstack/react-query"
import { Label } from "@/components/ui/shadcn/label"
import { toast } from "@/components/ui/use-toast"
import { MdEdit } from "react-icons/md"
import { Payment } from "@/types/payment"
import DeleteItemPayment from "@/components/helpers/DeletePaymentItem"

const INITIAL_DATA: {
  amount: string
  payment_method: "كاش" | "فيزا"
  name: string
} = {
  amount: "",
  payment_method: "فيزا",
  name: ""
}

type EditPaymentProps = {
  payment: Payment
}

export default function EditPayment({ payment }: EditPaymentProps) {
  const queryClient = useQueryClient()
  const { updatePayment } = usePayment()
  const { userData } = useUser()

  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState(INITIAL_DATA)

  useEffect(() => {
    setFormData({
      amount: payment.amount.toString(),
      payment_method: payment.payment_method,
      name: payment.name
    })
  }, [payment])

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!parseInt(formData.amount)) return

    updatePayment.mutate(
      {
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method as "فيزا" | "كاش",
        name: formData.name,
        payment_type: "spending",
        category: "expenses",
        visit_id: surrealDbId(userData?.id)
      },
      {
        onSuccess: () => {
          queryClient.refetchQueries({
            queryKey: ["get_filtered_payments"]
          })
          toast({
            title: "تم تعديل المحاسبة بنجاح بنجاح"
          })
          setFormData(INITIAL_DATA)
          setIsOpen(false)
        }
      }
    )
  }

  return (
    <>
      <Modal
        title={"عدل المحاسبة"}
        trigger={
          <Button size={"icon"} variant={"ghost"} className="hover:text-primary">
            <MdEdit className="text-2xl" />
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

          <table className="w-full mt-4">
            <tr className="w-full">
              <th className="text-start">عناصر المحاسبة</th>
              <th className="text-start">الحساب</th>
              <th></th>
            </tr>
            {payment.payment_items && payment.payment_items.length > 0
              ? payment.payment_items.map((item) => (
                  <tr key={item.id.id.String} className="w-full">
                    <td className="py-2">
                      {item.name === "treatment_cost" ? "حساب الجلسة" : item.name}
                    </td>
                    <td className="py-2">{formatCurrency(item.amount)}</td>
                    <td className="flex justify-end py-2">
                      <DeleteItemPayment paymentId={payment.id} paymentItemId={item.id}>
                        <FaX />
                      </DeleteItemPayment>
                    </td>
                  </tr>
                ))
              : ""}
          </table>

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
    </>
  )
}
