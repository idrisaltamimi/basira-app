import { ChangeEvent, FormEvent, useEffect, useState } from "react"

import { Button } from "@/components/ui/shadcn/button"
import { TextField } from "@/components/form/Textfield"
import RadioInput from "@/components/form/RadioInput"
import { useVisitor } from "@/hooks"
import { DatePickerWrapper } from "@/components"
import ReactDatePicker from "react-datepicker"
import { Label } from "@/components/ui/shadcn/label"
import { ImSpinner2 } from "react-icons/im"
import { toast } from "@/components/ui/use-toast"

import "react-datepicker/dist/react-datepicker.css"
import { Visitor } from "@/lib/types"
import { surrealDbId } from "@/lib/utils"

const INITIAL_FORM_DATA: {
  name: string
  phone: string
  civil_id?: string
  birthdate: Date | null
  gender: "ذكر" | "أنثى"
  file_number: string
} = {
  name: "",
  phone: "",
  civil_id: "",
  birthdate: new Date(),
  gender: "ذكر",
  file_number: ""
}
export default function UpdateVisitor({ visitor }: { visitor: Visitor }) {
  const { updateVisitor } = useVisitor()
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  useEffect(() => {
    if (visitor) {
      setFormData({
        birthdate: visitor.birthdate ? new Date(visitor.birthdate) : null,
        name: visitor.name,
        phone: visitor.phone.toString(),
        civil_id: visitor.civil_id ? visitor.civil_id?.toString() : "",
        gender: visitor.gender,
        file_number: visitor.file_number.toString()
      })
    }
  }, [visitor.id])

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (formData.birthdate == null) return

    updateVisitor.mutate(
      {
        ...formData,
        birthdate: formData.birthdate as Date,
        file_number: parseInt(formData.file_number),
        phone: parseInt(formData.phone),
        civil_id: formData.civil_id ? parseInt(formData.civil_id) : undefined,
        id: surrealDbId(visitor.id)
      },
      {
        onSuccess: () => {
          toast({
            title: "تم التعديل بنجاح",
            duration: 3000
          })
        },
        onError: (error) => {
          const civilIdErr = "visitor with the civil_id already exists"
          if (error.message === civilIdErr) {
            toast({
              variant: "destructive",
              title: "خطأ في الرقم المدني",
              description: "يوجد زائر مسجل بهذا الرقم المدني"
            })
          } else {
            toast({
              variant: "destructive",
              title: "!حدث خطأ ما! حاول مرة أخرى",
              duration: 3000
            })
          }
        }
      }
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 p-6 border border-input shadow-sm max-w-[800px] rounded-3xl"
    >
      <div className="flex items-center gap-4 mt-2">
        <Label>الجنس:</Label>
        <RadioInput
          label="ذكر"
          id="male"
          name="gender"
          value="ذكر"
          checked={formData.gender === "ذكر"}
          onChange={handleChange}
        />
        <RadioInput
          label="أنثى"
          id="female"
          name="gender"
          value="أنثى"
          checked={formData.gender === "أنثى"}
          onChange={handleChange}
        />
      </div>

      <TextField
        required
        label="الاسم"
        name="name"
        placeholder="اسم الزائر"
        value={formData.name}
        onChange={handleChange}
      />

      <TextField
        required
        label="رقم الهاتف"
        name="phone"
        type="number"
        value={formData.phone}
        onChange={handleChange}
      />

      <TextField
        required
        label="رقم الملف"
        name="file_number"
        type="number"
        value={formData.file_number}
        onChange={handleChange}
      />

      <DatePickerWrapper label="تاريخ الميلاد*" className="bg-background">
        <ReactDatePicker
          className="datepicker"
          selected={formData.birthdate}
          onChange={(date) => setFormData((prev) => ({ ...prev, birthdate: date }))}
        />
      </DatePickerWrapper>

      <TextField
        label="الرقم المدني"
        name="civil_id"
        type="number"
        value={formData.civil_id}
        onChange={handleChange}
      />

      <Button variant="default" className="mt-auto" disabled={updateVisitor.isPending}>
        {updateVisitor.isPending ? (
          <ImSpinner2 className="text-xl animate-spin" />
        ) : (
          "احفظ"
        )}
      </Button>
    </form>
  )
}
