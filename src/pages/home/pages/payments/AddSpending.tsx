import { FormEvent, useState } from "react"
import { FaAddressCard } from "react-icons/fa6"

import { Button } from "@/components/ui/shadcn/button"
import usePayment from "@/hooks/usePayment"
import { surrealDbId } from "@/lib/utils"
import { Modal, Notification, TextField } from "@/components"
import { useUser } from "@/hooks"
import { useQueryClient } from "@tanstack/react-query"

export default function AddSpending({
  setRefetch
}: {
  setRefetch: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const queryClient = useQueryClient()
  const { createNewPayment } = usePayment()
  const { userData } = useUser()

  const [isOpen, setIsOpen] = useState(false)
  const [spendingAmount, setSpendingAmount] = useState("")
  const [spendingName, setSpendingName] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!parseInt(spendingAmount)) return

    createNewPayment.mutate(
      {
        amount: spendingAmount,
        name: spendingName,
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
          <TextField
            label="اسم المصروفات"
            id="spending-amount"
            value={spendingName}
            onChange={(e) => setSpendingName(e.target.value)}
            required
          />

          <TextField
            label="حساب المصاريف"
            id="spending-amount"
            value={spendingAmount}
            type="number"
            onChange={(e) => setSpendingAmount(e.target.value)}
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
