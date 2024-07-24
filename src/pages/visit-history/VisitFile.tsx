import { Visit } from "@/types/visit"
import { decompressFromUTF16 } from "lz-string"
import CanvasDraw from "react-canvas-draw"
import muscularSystem from "@/assets/muscular-system.jpg"
import { Textarea } from "@/components/ui/shadcn/textarea"
import { TextField } from "@/components"
import { calculateAge, formatCurrency } from "@/lib/utils"

export default function VisitFile({ visit }: { visit: Visit }) {
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
      <div className="relative bg-white w-[900px] h-[377.9px] mx-auto rounded-3xl">
        <CanvasDraw
          className="relative z-10"
          backgroundColor="transparent"
          hideGrid
          disabled
          brushRadius={2}
          lazyRadius={0}
          loadTimeOffset={0}
          canvasWidth={900}
          canvasHeight={377.9}
          saveData={decompressFromUTF16(visit.treatment_img ?? "")}
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
          className="mt-2 text-base font-normal text-black rounded-3xl disabled:text-black disabled:opacity-100"
          value={visit.description}
          disabled
        />

        <div className="flex gap-4">
          <TextField
            label="الأعراض التي يعاني منها المريض"
            name="symptoms"
            value={visit.symptoms}
            className="disabled:text-black disabled:opacity-100"
            disabled
          />
        </div>
        <div className="flex gap-4">
          <TextField
            label="نوع العلاج"
            name="treatment_type"
            value={visit.treatment_type}
            className="disabled:text-black disabled:opacity-100"
            disabled
          />
          <TextField
            label="اسم العلاج"
            name="prescription"
            value={visit.prescription}
            className="disabled:text-black disabled:opacity-100"
            disabled
          />
        </div>

        <div className="flex gap-4">
          <TextField
            label="حساب الجلسة"
            name="treatment_cost"
            value={formatCurrency(visit.treatment_cost ?? 0)}
            className="disabled:text-black disabled:opacity-100"
            disabled
          />
          <TextField
            label="حساب الأدوية"
            name="prescription_cost"
            value={formatCurrency(visit.prescription_cost ?? 0)}
            className="disabled:text-black disabled:opacity-100"
            disabled
          />
        </div>
      </div>
    </div>
  )
}
