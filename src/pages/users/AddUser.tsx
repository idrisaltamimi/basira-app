import { ChangeEvent, FormEvent, ReactNode, useState } from "react"
import ReactDatePicker from "react-datepicker"

import { Button } from "@/components/ui/shadcn/button"
import { Label } from "@/components/ui/shadcn/label"
import { TiUserAdd } from "react-icons/ti"
import { useAuth } from "@/queries"
import {
  Spinner,
  Modal,
  RadioInput,
  TextField,
  TooltipWrapper,
  Notification,
  DatePickerWrapper
} from "@/components"

import "react-datepicker/dist/react-datepicker.css"

type InitialFormDataType = {
  name: string
  password: string
  confirmPassword: string
  email: string
  role: "موظف" | "معالج" | "مدير"
  phone: string
  civilId: string
  gender: "ذكر" | "أنثى"
  birthdate: Date | null
}

const initialFormData: InitialFormDataType = {
  name: "",
  password: "",
  confirmPassword: "",
  email: "",
  role: "موظف",
  phone: "",
  civilId: "",
  gender: "ذكر",
  birthdate: new Date()
}

export function AddUser() {
  const { signUp } = useAuth()

  const [openDialog, setOpenDialog] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [formData, setFormData] = useState(initialFormData)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setError("")

    if (formData.confirmPassword !== formData.password) {
      return setPasswordError("كلمتا المرور غير متطابقة")
    }
    if (!formData.birthdate) return

    const { confirmPassword, civilId, birthdate, ...data } = formData
    signUp.mutate(
      {
        ...data,
        civil_id: parseInt(civilId),
        birthdate: birthdate.toISOString()
      },
      {
        onSuccess: () => {
          setFormData(initialFormData)
          setError("")
          setPasswordError("")
          setOpenDialog(false)
        },
        onError: (error) => {
          const errorMessage = typeof error === "string" ? error : JSON.stringify(error)
          const civilIdErr = "Database index `userCivilIdIndex` already contains"
          const emailErr = "Database index `userEmailIndex` already contains"

          if (errorMessage.includes(emailErr)) {
            setError("البريد الالكتروني مستخدم!")
          } else if (errorMessage.includes(civilIdErr)) {
            setError("الرقم المدني مستخدم!")
          } else {
            setError("حدث خطأ ما! حاول مرة أخرى")
          }
        }
      }
    )
  }

  const handleChange = (e: ChangeEvent) => {
    const { name, value } = e.target as HTMLInputElement
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <Modal
        open={openDialog}
        onOpenChange={setOpenDialog}
        title={"أضف مستخدم جديد"}
        trigger={
          <TooltipWrapper content="أضف مستخدم جديد">
            <Button size={"icon"} variant={"outline"} className="mr-4">
              <TiUserAdd className="text-2xl" />
            </Button>
          </TooltipWrapper>
        }
      >
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <GenderRadioGroup formData={formData} onChange={handleChange} />
          <UserTypeRadioGroup formData={formData} onChange={handleChange} />
          <FormRow>
            <TextField
              required
              label="الاسم"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <DatePickerWrapper label="تاريخ الميلاد*">
              <ReactDatePicker
                className="datepicker"
                dateFormat="dd/MM/yyyy"
                selected={formData.birthdate}
                onChange={(date) => setFormData((prev) => ({ ...prev, birthdate: date }))}
              />
            </DatePickerWrapper>
          </FormRow>

          <FormRow>
            <TextField
              label="البريد الاكتروني"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              required
              label="الرقم المدني"
              name="civilId"
              value={formData.civilId}
              type="number"
              onChange={handleChange}
            />
          </FormRow>

          <div>
            <FormRow>
              <TextField
                required
                label="كلمة المرور"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={passwordError !== ""}
              />
              <TextField
                required
                label="تأكيد كلمة المرور"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={passwordError !== ""}
              />
            </FormRow>
            <div className="text-sm text-red-500">{passwordError}</div>
          </div>

          <div className="w-[calc(50%-16px)] mt-0">
            <TextField
              required
              label="رقم الهاتف"
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="text-sm text-red-500">{error}</div>
          <div className="flex w-full gap-6 basis-full">
            <Button className="basis-full" type="submit">
              {signUp.isPending ? <Spinner>أضف</Spinner> : "أضف"}
            </Button>
            <Button
              className="basis-full"
              type="button"
              variant="secondary"
              onClick={() => {
                setFormData(initialFormData)
                setPasswordError("")
              }}
            >
              مسح النص
            </Button>
          </div>
        </form>
      </Modal>
      {signUp.isSuccess && <Notification message="تم إضافة المستخدم بنجاح" />}
    </>
  )
}

function FormRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-8 sm:flex-row">{children}</div>
}

type RadioGroupType = {
  formData: InitialFormDataType
  onChange: (e: ChangeEvent) => void
}

function UserTypeRadioGroup({ formData, onChange }: RadioGroupType) {
  return (
    <div className="flex items-center gap-4 mt-2">
      <Label>نوع المستخدم:</Label>
      <RadioInput
        label="موظف"
        id="user"
        value="موظف"
        name="role"
        checked={formData.role === "موظف"}
        onChange={onChange}
      />
      <RadioInput
        label="معالج"
        id="doctor"
        value="معالج"
        name="role"
        checked={formData.role === "معالج"}
        onChange={onChange}
      />
      <RadioInput
        label="مدير"
        id="manager"
        value="مدير"
        name="role"
        checked={formData.role === "مدير"}
        onChange={onChange}
      />
    </div>
  )
}

function GenderRadioGroup({ formData, onChange }: RadioGroupType) {
  return (
    <div className="flex items-center gap-4 mt-2">
      <Label>الجنس:</Label>
      <RadioInput
        label="ذكر"
        id="male"
        value="ذكر"
        name="gender"
        checked={formData.gender === "ذكر"}
        onChange={onChange}
      />
      <RadioInput
        label="أنثى"
        id="female"
        value="أنثى"
        name="gender"
        checked={formData.gender === "أنثى"}
        onChange={onChange}
      />
    </div>
  )
}
