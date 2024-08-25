import { useEffect, useState } from "react"
import CanvasDraw from "react-canvas-draw"
import { LuUndo2 } from "react-icons/lu"
import { MdDeleteForever } from "react-icons/md"
import muscularSystem from "../../assets/muscular-system.jpg"
import { decompressFromUTF16 } from "lz-string"

import { TextField } from "@/components/form/Textfield"
import { Textarea } from "@/components/ui/shadcn/textarea"
import { Button } from "@/components/ui/shadcn/button"
import { useUser, useVisit } from "@/queries"
import { surrealDbId } from "@/lib/utils"
import { Visit } from "@/types/visit"
import useCanvas from "@/hooks/useCanvas"

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

export default function VisitForm({ visit }: { visit: Visit | undefined }) {
  const { userData } = useUser()
  const { updateVisit } = useVisit()

  const { undo, clear, image, selectColor, color, canvasRef } = useCanvas()
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

    updateVisit.mutate({
      treatment_img: image(),
      description: formData.description ?? "",
      treatment_type: formData.treatment_type ?? "",
      prescription: formData.prescription ?? "",
      symptoms: formData.symptoms ?? "",
      treatment_cost: parseFloat(formData?.treatment_cost ?? ""),
      prescription_cost: parseFloat("0"),
      doctor: surrealDbId(userData?.id),
      visit_id: surrealDbId(visit?.id)
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <h2>مواضع العلاج</h2>
        <hr />
      </div>
      <div className="flex items-center gap-4">
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

      <div className="flex flex-col gap-4 mt-6">
        <h2>التوضيحات</h2>
        <Textarea
          name="description"
          placeholder=""
          className="mt-2 text-base font-normal text-black rounded-3xl"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <div className="flex gap-4">
          <TextField
            label="الأعراض التي يعاني منها المريض"
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex gap-4">
          <TextField
            label="نوع العلاج"
            name="treatment_type"
            value={formData.treatment_type}
            onChange={handleChange}
            required
          />
          <TextField
            label="اسم العلاج"
            name="prescription"
            value={formData.prescription}
            onChange={handleChange}
            required
          />
        </div>

        <div className="w-1/2 pl-2">
          <TextField
            label="حساب الجلسة"
            name="treatment_cost"
            type="number"
            value={formData.treatment_cost}
            onChange={handleChange}
            required
          />
          {/* <TextField
            label="حساب الأدوية"
            name="prescription_cost"
            type="number"
            value={formData.prescription_cost}
            onChange={handleChange}
            required
          /> */}
        </div>

        <Button className="self-start mt-4 px-14">حفظ</Button>
      </div>
    </form>
  )
}
