import { useRef, useState } from "react"
import CanvasDraw from "react-canvas-draw"
import { LuUndo2 } from "react-icons/lu"
import { MdDeleteForever } from "react-icons/md"
import muscularSystem from "../../assets/muscular-system.jpg"
import { compressToUTF16 } from "lz-string"

import { TextField } from "@/components/form/Textfield"
import { Textarea } from "@/components/ui/shadcn/textarea"
import { Button } from "@/components/ui/shadcn/button"
import usePayment from "@/hooks/usePayment"
import { useUser, useVisit } from "@/hooks"
import { surrealDbId } from "@/lib/utils"
import { Notification } from "@/components"
import { NewPayment } from "@/types/payment"

const initialVisitData = {
  treatment_img: "",
  description: "",
  treatment_type: "",
  prescription: "",
  symptoms: "",
  treatment_cost: "",
  prescription_cost: "",
  doctor: ""
}

export default function VisitForm({ visitId }: { visitId: string }) {
  const { userData } = useUser()
  const { createNewPayment } = usePayment()
  const { updateVisit } = useVisit()

  const { undo, clear, image, selectColor, color, canvasRef } = useCanvas()
  const [visitForm, setVisitForm] = useState(initialVisitData)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent) => {
    const { name, value } = e.target as HTMLInputElement
    setVisitForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    const paymentData = (name: "زيارة" | string | "جلسة" | "أدوية"): NewPayment => ({
      name: name,
      payment_type: "payment",
      category: "visits",
      pending: true,
      amount: name === "جلسة" ? visitForm.treatment_cost : visitForm.prescription_cost,
      visit_id: visitId
    })

    if (visitForm.treatment_cost) {
      createNewPayment.mutate(paymentData("جلسة"))
    }
    if (visitForm.prescription_cost) {
      createNewPayment.mutate(paymentData("أدوية"))
    }

    const visitData = {
      treatment_img: image(),
      description: visitForm.description,
      treatment_type: visitForm.treatment_type,
      prescription: visitForm.prescription,
      symptoms: visitForm.symptoms,
      treatment_cost: parseFloat(visitForm.treatment_cost),
      prescription_cost: parseFloat(visitForm.prescription_cost),
      doctor: surrealDbId(userData?.id),
      visit_id: visitId
    }

    updateVisit.mutate(visitData, {
      onSuccess: () => {
        setSuccess(true)
        // setVisitForm(initialVisitData)
      }
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <h2>مواضع العلاج</h2>
        <hr />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={undo} className="flex gap-2">
          <LuUndo2 className="-scale-x-100" />
          تراجع
        </Button>

        <Button variant="outline" size="sm" onClick={clear} className="flex gap-2">
          <MdDeleteForever />
          حذف
        </Button>

        <div className="flex gap-1 mr-auto">
          <Button
            size="icon"
            className="w-6 h-6 bg-black rounded-full"
            value="rgb(0, 0, 0)"
            onClick={selectColor}
          />
          <Button
            size="icon"
            className="w-6 h-6 bg-red-700 rounded-full"
            value="rgb(185 28 28)"
            onClick={selectColor}
          />
          <Button
            size="icon"
            className="w-6 h-6 bg-blue-700 rounded-full"
            value="rgb(29 78 216)"
            onClick={selectColor}
          />
          <Button
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
          // saveData={decompress("")}
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
          id="description"
          name="description"
          placeholder=""
          className="mt-2 text-base font-normal text-black rounded-3xl"
          onChange={handleChange}
          required
        />

        <div className="flex gap-4">
          <TextField
            label="الأعراض التي يعاني منها المريض"
            name="symptoms"
            value={visitForm.symptoms}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex gap-4">
          <TextField
            label="نوع العلاج"
            name="treatment_type"
            value={visitForm.treatment_type}
            onChange={handleChange}
            required
          />
          <TextField
            label="اسم العلاج"
            name="prescription"
            value={visitForm.prescription}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex gap-4">
          <TextField
            label="حساب الجلسة"
            name="treatment_cost"
            type="number"
            value={visitForm.treatment_cost}
            onChange={handleChange}
            required
          />
          <TextField
            label="حساب الأدوية"
            name="prescription_cost"
            type="number"
            value={visitForm.prescription_cost}
            onChange={handleChange}
            required
          />
        </div>

        <Button className="self-start mt-4 px-14">حفظ</Button>
      </div>
      {success && <Notification message="تم حفظ الزيارة بنجاح" />}
    </form>
  )
}

function useCanvas() {
  const [color, setColor] = useState("rgb(0, 0, 0)")

  const canvasRef = useRef<CanvasDraw | null>(null)

  const selectColor = (e: React.MouseEvent<HTMLButtonElement>) => {
    setColor(e.currentTarget.value)
  }

  const undo = () => {
    if (!canvasRef.current) return
    canvasRef.current.undo()
  }

  const clear = () => {
    if (!canvasRef.current) return
    canvasRef.current.clear()
  }

  const image = () => {
    if (!canvasRef.current) return ""
    const imgString = canvasRef.current.getSaveData()
    const compressToUTF16Image = compressToUTF16(imgString)
    return compressToUTF16Image
  }

  return { color, selectColor, undo, clear, image, canvasRef }
}
