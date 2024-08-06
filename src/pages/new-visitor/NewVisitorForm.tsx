import { ChangeEvent, FormEvent, useState } from "react"

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

type VisitorData = {
  name: string
  phone: string
  civil_id?: string
  birthdate: Date | null
  nationality: "عماني" | "وافد"
  gender: "ذكر" | "أنثى"
}

const visitor: VisitorData = {
  name: "",
  phone: "",
  civil_id: "",
  birthdate: new Date(),
  nationality: "عماني",
  gender: "ذكر"
}

export function NewVisitorForm() {
  const { createVisitor } = useVisitor()

  const [newVisitor, setNewVisitor] = useState(visitor)

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setNewVisitor((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const { nationality, phone, birthdate, civil_id, ...rest } = newVisitor
    if (birthdate == null) return

    const data = {
      ...rest,
      birthdate: birthdate.toISOString(),
      phone: parseInt(phone),
      civil_id: civil_id ? parseInt(civil_id) : undefined
    }

    createVisitor.mutate(data, {
      onSuccess: () => {
        setNewVisitor(visitor)
        toast({
          title: "تم إضافة الزائر بنجاح",
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
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 p-6 border border-input shadow-sm max-w-[800px] rounded-3xl mx-auto"
      autoComplete="off"
    >
      <div className="flex items-center gap-4 mt-2">
        <Label>الجنس:</Label>
        <RadioInput
          label="ذكر"
          id="male"
          name="gender"
          value="ذكر"
          checked={newVisitor.gender === "ذكر"}
          onChange={handleChange}
        />
        <RadioInput
          label="أنثى"
          id="female"
          name="gender"
          value="أنثى"
          checked={newVisitor.gender === "أنثى"}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-4 mt-2">
        <Label>الجنسية:</Label>
        <RadioInput
          label="عماني"
          id="omani"
          name="nationality"
          value="عماني"
          checked={newVisitor.nationality === "عماني"}
          onChange={handleChange}
        />
        <RadioInput
          label="وافد"
          id="foreigner"
          name="nationality"
          value="وافد"
          checked={newVisitor.nationality === "وافد"}
          onChange={handleChange}
        />
      </div>

      <TextField
        required
        label="الاسم"
        name="name"
        placeholder="اسم الزائر"
        value={newVisitor.name}
        onChange={handleChange}
      />

      <TextField
        required
        autoComplete="off"
        label="رقم الهاتف"
        name="phone"
        type="number"
        value={newVisitor.phone}
        onChange={handleChange}
      />

      <DatePickerWrapper label="تاريخ الميلاد*" className="bg-background">
        <ReactDatePicker
          className="datepicker"
          selected={newVisitor.birthdate}
          dateFormat="dd/MM/yy"
          onChange={(date) => setNewVisitor((prev) => ({ ...prev, birthdate: date }))}
        />
      </DatePickerWrapper>

      <TextField
        label="الرقم المدني"
        name="civil_id"
        type="number"
        value={newVisitor.civil_id}
        disabled={newVisitor.nationality === "عماني"}
        required={newVisitor.nationality === "وافد"}
        onChange={handleChange}
      />

      <Button variant="default" className="mt-auto" disabled={createVisitor.isPending}>
        {createVisitor.isPending ? (
          <ImSpinner2 className="text-xl animate-spin" />
        ) : (
          "افتح زيارة"
        )}
      </Button>
    </form>
  )
}
