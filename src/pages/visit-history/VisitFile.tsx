import { useEffect, useState } from "react"
import CanvasDraw from "react-canvas-draw"
import { decompressFromUTF16 } from "lz-string"

import { Visit } from "@/types/visit"
import muscularSystem from "@/assets/muscular-system.jpg"
import { Textarea } from "@/components/ui/shadcn/textarea"
import { TextField } from "@/components"
import { calculateAge, formatCurrency, surrealDbId } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn/button"
import useCanvas from "@/hooks/useCanvas"
import { usePayment, useVisit } from "@/queries"
import { LuUndo2 } from "react-icons/lu"
import { MdDeleteForever } from "react-icons/md"

const INITIAL_FORM_DATA: {
  treatment_img?: string
  description?: string
  treatment_type?: string
  doctor_name?: string
  prescription?: string
  treatment_cost?: string
  prescription_cost?: string
  symptoms?: string
} = {
  treatment_img: "",
  description: "",
  treatment_type: "",
  prescription: "",
  symptoms: "",
  treatment_cost: "",
  prescription_cost: ""
}

export default function VisitFile({ visit }: { visit: Visit }) {
  const { undo, clear, image, selectColor, color, canvasRef } = useCanvas()
  const { updateVisit } = useVisit()
  const { createNewPayment } = usePayment()

  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  const handleChange = (e: React.ChangeEvent) => {
    const { name, value } = e.target as HTMLInputElement
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (!visit) return
    setFormData({
      treatment_img: visit.treatment_img,
      description: visit.description,
      treatment_type: visit.treatment_type,
      prescription: visit.prescription,
      symptoms: visit.symptoms,
      treatment_cost: visit.treatment_cost?.toString(),
      prescription_cost: visit.prescription_cost?.toString()
    })
  }, [visit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const visitData = {
      treatment_img: image(),
      description: formData.description ?? "",
      treatment_type: formData.treatment_type ?? "",
      prescription: formData.prescription ?? "",
      symptoms: formData.symptoms ?? "",
      treatment_cost: parseFloat(formData?.treatment_cost ?? ""),
      prescription_cost: parseFloat("0"),
      doctor: surrealDbId(visit.doctor_id),
      visit_id: surrealDbId(visit?.id)
    }

    updateVisit.mutate(visitData, {
      onSuccess: async () => {
        if (visit.treatment_cost === parseFloat(formData?.treatment_cost ?? "")) return
        await createNewPayment.mutate({
          payment_type: "payment",
          payment_method: "فيزا",
          name: "treatment_cost",
          category: "visits",
          amount: parseFloat(formData?.treatment_cost ?? ""),
          visit_id: surrealDbId(visit?.id),
          pending: true
        })
      }
    })
  }

  return (
    <div>
      <div className="flex justify-between w-full gap-6">
        <div className="basis-full">
          <div className="flex gap-2">
            <span className="text-sm font-bold text-muted-foreground">الاسم:</span>
            {visit.visitor_name}
          </div>
          <div className="flex gap-2">
            <span className="text-sm font-bold text-muted-foreground">العمر:</span>
            {calculateAge(visit.visitor_birthdate)}
          </div>
          <div className="flex gap-2">
            <span className="text-sm font-bold text-muted-foreground">رقم الهاتف:</span>
            {visit.visitor_phone}
          </div>
        </div>
        <div className="basis-full">
          <div className="flex gap-2">
            <span className="text-sm font-bold text-muted-foreground">المعالج:</span>
            {visit.doctor_name}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground">رقم الملف:</span>
            <span className="text-lg font-bold text-red-600">
              {visit.visitor_file_number}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-6 mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={undo}
          className="flex gap-2"
        >
          <LuUndo2 className="-scale-x-100" />
          تراجع
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          className="flex gap-2"
        >
          <MdDeleteForever />
          حذف
        </Button>

        <div className="flex gap-1 mr-auto">
          <Button
            type="button"
            size="icon"
            className="w-6 h-6 bg-black rounded-full"
            value="rgb(0, 0, 0)"
            onClick={selectColor}
          />
          <Button
            type="button"
            size="icon"
            className="w-6 h-6 bg-red-700 rounded-full"
            value="rgb(185 28 28)"
            onClick={selectColor}
          />
          <Button
            type="button"
            size="icon"
            className="w-6 h-6 bg-blue-700 rounded-full"
            value="rgb(29 78 216)"
            onClick={selectColor}
          />
          <Button
            type="button"
            size="icon"
            className="w-6 h-6 bg-green-700 rounded-full"
            value="rgb(21 128 61)"
            onClick={selectColor}
          />
        </div>
      </div>
      <div className="relative bg-white w-[900px] h-[377.9px] mx-auto rounded-3xl">
        <CanvasDraw
          className="relative z-10"
          ref={canvasRef}
          backgroundColor="transparent"
          hideGrid
          brushColor={color}
          catenaryColor={color}
          brushRadius={2}
          lazyRadius={0}
          loadTimeOffset={0}
          canvasWidth={900}
          canvasHeight={377.9}
          saveData={decompressFromUTF16(formData.treatment_img ?? "")}
        />

        <img
          src={muscularSystem}
          alt=""
          width={900}
          height={377.9}
          className="absolute top-0 right-0 object-contain w-full h-full pointer-events-none rounded-3xl"
        />
      </div>

      <form className="flex flex-col gap-4 mt-6" onSubmit={handleSubmit}>
        <h2>التوضيحات</h2>
        <Textarea
          id="description"
          name="description"
          placeholder=""
          className="mt-2 text-base font-normal text-black rounded-3xl disabled:text-black disabled:opacity-100"
          value={visit.description}
          onChange={handleChange}
        />

        <div className="flex gap-4">
          <TextField
            label="الأعراض التي يعاني منها المريض"
            name="symptoms"
            value={visit.symptoms}
            className="disabled:text-black disabled:opacity-100"
            onChange={handleChange}
          />
        </div>
        <div className="flex gap-4">
          <TextField
            label="نوع العلاج"
            name="treatment_type"
            value={visit.treatment_type}
            className="disabled:text-black disabled:opacity-100"
            onChange={handleChange}
          />
          <TextField
            label="اسم العلاج"
            name="prescription"
            value={visit.prescription}
            className="disabled:text-black disabled:opacity-100"
            onChange={handleChange}
          />
        </div>

        <div className="w-1/2 pl-2">
          <TextField
            label="حساب الجلسة"
            name="treatment_cost"
            value={formatCurrency(visit.treatment_cost ?? 0)}
            className="disabled:text-black disabled:opacity-100"
            onChange={handleChange}
          />
        </div>

        <Button className="self-start mt-4 px-14">حفظ</Button>
      </form>
    </div>
  )
}
