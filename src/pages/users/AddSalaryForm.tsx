import { Label } from "@/components/ui/shadcn/label"
import { ChangeEvent, FormEvent, useState } from "react"
import { TextField } from "@/components/form/Textfield"
import RadioInput from "@/components/form/RadioInput"
import { Button } from "@/components/ui/shadcn/button"
import Modal from "@/components/ui/Modal"
import { MdPayments } from "react-icons/md"
import { usePayment } from "@/hooks"
import { isValidNumber } from "@/lib/utils"
import { Notification, TooltipWrapper } from "@/components"

type AddSalaryDialogProps = {
  userId: string
  userName: string
}

type InitialSalaryDataType = {
  amount: string
  salary_type: "يومي" | "شهري" | "علاوة"
}

const INITIAL_SALARY_DATA: InitialSalaryDataType = {
  amount: "",
  salary_type: "يومي"
}

export function AddSalaryForm({ userId, userName }: AddSalaryDialogProps) {
  const { createNewPayment } = usePayment()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState(INITIAL_SALARY_DATA)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSuccess(false)

    if (!isValidNumber(formData.amount)) return

    await createNewPayment.mutate(
      {
        name: formData.salary_type,
        payment_type: "spending",
        category: "salaries",
        amount: formData.amount,
        visit_id: userId,
        pending: false
      },
      {
        onSuccess: () => {
          setSuccess(true)
          setFormData(INITIAL_SALARY_DATA)
          setDialogOpen(false)
        }
      }
    )
  }

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <Modal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={`أضف راتب لـ ${userName}`}
        trigger={
          <TooltipWrapper content="أضف راتب">
            <Button variant={"ghost"} size={"icon"} className="hover:text-primary">
              <MdPayments className="text-xl" />
            </Button>
          </TooltipWrapper>
        }
      >
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <Label>نوع الراتب</Label>
          <div className="flex gap-4 mb-4">
            <RadioInput
              label="يومي"
              id="daily"
              name="salary_type"
              value={"يومي"}
              checked={formData.salary_type === "يومي"}
              onChange={handleChange}
            />
            <RadioInput
              label="شهري"
              id="monthly"
              name="salary_type"
              value={"شهري"}
              checked={formData.salary_type === "شهري"}
              onChange={handleChange}
            />
            <RadioInput
              label="علاوة"
              id="bonus"
              name="salary_type"
              value={"علاوة"}
              checked={formData.salary_type === "علاوة"}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="flex items-center gap-2 basis-full">
              <TextField
                label="المبلغ"
                name="amount"
                type="number"
                pattern="[0-9]*"
                value={formData.amount}
                onChange={handleChange}
              />
              <span className="font-semibold">ر.ع.</span>
            </div>
            <div className="basis-full" />
          </div>
          <div className="flex items-center w-full gap-4 mt-4">
            <Button type="submit" className="basis-full">
              أرسل
            </Button>
            <Button
              type="button"
              variant={"secondary"}
              className="basis-full"
              onClick={() => {
                setDialogOpen(false)
                setFormData(INITIAL_SALARY_DATA)
              }}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>
      {success && <Notification message="تم إضافة الراتب بنجاح" />}
    </>
  )
}
