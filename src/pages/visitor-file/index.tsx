import VisitForm from "./VisitForm"
import { calculateAge } from "@/lib/utils"
import { useRecord } from "@/hooks"
import { useQuery } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"
import { MedicalHistory, Record } from "@/types/visitor-file"
import { Visit } from "@/types/visit"
import { Button } from "@/components/ui/shadcn/button"
import { FaPlus } from "react-icons/fa6"
import { Modal } from "@/components"
import { Checkbox } from "@/components/ui/shadcn/checkbox"
import { Input } from "@/components/ui/shadcn/input"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { CheckedState } from "@radix-ui/react-checkbox"
import { FaEdit } from "react-icons/fa"

const newRecordData: MedicalHistory = {
  did_surgery: undefined,
  has_disease: undefined,
  use_medicine: undefined,
  allergy: undefined,
  heart_problems: undefined,
  high_blood_pressure: undefined,
  diabetes: undefined,
  pregnant: undefined,
  smokes: undefined,
  others: undefined
}

export default function VisitorFile() {
  const { createRecord, updateRecord } = useRecord()

  const { data: visitorId } = useQuery<string>({
    queryKey: ["visitorId"],
    enabled: false // Disable automatic refetching since this data is set elsewhere
  })

  const [visit, setVisit] = useState<Visit>()
  const [formData, setFormData] = useState(newRecordData)
  const [isOpen, setIsOpen] = useState(false)

  const { data: record } = useQuery({
    queryKey: ["get_record"],
    queryFn: async () => {
      try {
        const res: Record = await invoke("get_record", {
          visitorId
        })
        return res
      } catch (error) {
        console.error(error)
      }
    },
    enabled: !!visitorId
  })

  useEffect(() => {
    const getVisit = async () => {
      try {
        const res: Visit = await invoke("get_visit", { visitorId })
        setVisit(res)
      } catch (error) {
        console.log(error)
      }
    }
    getVisit()
  }, [visitorId])

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (value: CheckedState, name: RecordNames) => {
    if (formData[name]) return
    setFormData((prev) => ({ ...prev, [name as string]: value ? "" : undefined }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!visitorId) return
    createRecord.mutate(
      { newRecord: formData, visitorId },
      {
        onSuccess: () => {
          setIsOpen(false)
          setFormData(newRecordData)
        }
      }
    )
  }

  const handleUpdateRecordSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!visitorId) return
    updateRecord.mutate(
      { newRecord: formData, visitorId },
      {
        onSuccess: () => {
          setIsOpen(false)
          setFormData(newRecordData)
        }
      }
    )
  }

  const handleOpenModal = () => {
    if (!record) return
    setFormData(record)
  }

  return (
    <div>
      <h1>ملف {visit?.visitor_name}</h1>
      <hr />
      <div className="flex items-center w-full gap-8 mb-6">
        <div>
          <div className="text-sm">
            <span className="ml-2 font-semibold">العمر</span>
            {calculateAge(visit?.visitor_birthdate ?? "")}
          </div>
          <div className="text-sm">
            <span className="ml-2 font-semibold">رقم الهاتف</span>
            {visit?.visitor_phone}
          </div>
        </div>

        <div className="flex items-baseline gap-2 px-6 mr-auto">
          <span className="ml-2 text-sm font-semibold">رقم الملف</span>
          <span className="text-2xl text-red-700">{visit?.visitor_file_number}</span>
        </div>
      </div>
      <div className="flex gap-4 p-4 mb-6 rounded-lg">
        <div className="p-4 mb-6 border shadow-sm rounded-3xl basis-2/3">
          <VisitForm visit={visit} />
        </div>
        <div className="row-span-2 p-4 mb-6 border shadow-sm rounded-3xl basis-1/3 h-fit">
          <h2>السجل الطبي</h2>
          <hr />
          {record ? (
            <div>
              <table className="w-full mt-10 border">
                <thead className="border-b-[1px]">
                  <th className="py-6 text-sm border-l">الأعراض</th>
                  <th className="py-6 text-sm border-l">الاجابة</th>
                  <th className="py-6 text-sm">التوضيحات</th>
                </thead>
                <tbody>
                  {medicalRecord.map(({ id, name, question }) => (
                    <tr key={id} className="last:border-b">
                      <td className="py-6 text-sm border-l text-start w-fit">
                        {question}
                      </td>
                      <td className="py-6 text-sm text-center border-l">
                        {record[name] != null ? "نعم" : "لا"}
                      </td>
                      <td className="py-6 text-sm text-start">{record[name]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Modal
                open={isOpen}
                onOpenChange={setIsOpen}
                description={`عدل السجل الطبي لـ ${visit?.visitor_name}`}
                trigger={
                  <Button
                    onClick={handleOpenModal}
                    className="flex items-center gap-4 mt-6"
                    variant={"secondary"}
                  >
                    عدل السجل الطبي
                    <FaEdit />
                  </Button>
                }
              >
                <form onSubmit={handleUpdateRecordSubmit} aria-label="edit modal">
                  <table className="w-full mt-10">
                    <thead>
                      <tr className="border-b-[1px]">
                        <th className="text-start">الأعراض</th>
                        <th>هل لديه الأعراض</th>
                        <th>التوضيحات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalRecord.map(({ id, question, name }) => (
                        <tr key={id}>
                          <td className="py-2">{question}</td>
                          <td className="py-2 text-center">
                            <Checkbox
                              id={name}
                              name={name}
                              value={formData[name] == null ? undefined : formData[name]}
                              checked={formData[name] != null}
                              onCheckedChange={(value) =>
                                handleCheckboxChange(value, name)
                              }
                            />
                          </td>
                          <td className="py-2">
                            <Input
                              className="h-10"
                              id={name}
                              name={name}
                              value={formData[name] == null ? undefined : formData[name]}
                              onChange={handleChange}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-4 mt-8">
                    <Button className="basis-full">حفظ</Button>
                    <Button
                      type="button"
                      variant={"secondary"}
                      className="basis-full"
                      onClick={() => setFormData(newRecordData)}
                    >
                      امسح
                    </Button>
                  </div>
                </form>
              </Modal>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-2xl">
              <div>لا يوجد سجل طبي</div>
              <Modal
                title={"أضف سجل طبي"}
                open={isOpen}
                onOpenChange={setIsOpen}
                description={`أضف سجل طبي لـ ${visit?.visitor_name}`}
                trigger={
                  <Button variant={"outline"} className="flex items-center gap-4">
                    أضف سجل طبي
                    <FaPlus />
                  </Button>
                }
              >
                <form onSubmit={handleSubmit}>
                  <table className="w-full mt-10">
                    <thead>
                      <tr className="border-b-[1px]">
                        <th className="text-start">الأعراض</th>
                        <th>هل لديه الأعراض</th>
                        <th>التوضيحات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalRecord.map((record) => (
                        <tr key={record.id}>
                          <td className="py-2">{record.question}</td>
                          <td className="py-2 text-center">
                            <Checkbox
                              id={record.name}
                              name={record.name}
                              onCheckedChange={(value) =>
                                handleCheckboxChange(value, record.name)
                              }
                            />
                          </td>
                          <td className="py-2">
                            <Input
                              className="h-10"
                              id={record.name}
                              name={record.name}
                              value={formData[record.name]}
                              onChange={handleChange}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-4 mt-8">
                    <Button className="basis-full">حفظ</Button>
                    <Button
                      type="button"
                      variant={"secondary"}
                      className="basis-full"
                      onClick={() => setFormData(newRecordData)}
                    >
                      امسح
                    </Button>
                  </div>
                </form>
              </Modal>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type RecordNames =
  | "did_surgery"
  | "has_disease"
  | "use_medicine"
  | "allergy"
  | "heart_problems"
  | "high_blood_pressure"
  | "diabetes"
  | "pregnant"
  | "smokes"
  | "others"

type MedicalRecordNames = {
  id: string
  question: string
  name: RecordNames
}[]

const medicalRecord: MedicalRecordNames = [
  {
    id: "1",
    question: "هل أجريت عملية جراحية؟",
    name: "did_surgery"
  },
  {
    id: "2",
    question: "هل لديك مرض معين؟",
    name: "has_disease"
  },
  {
    id: "3",
    question: "هل تتناول بعض الادوية؟",
    name: "use_medicine"
  },
  {
    id: "4",
    question: "هل لديك حساسية؟",
    name: "allergy"
  },
  {
    id: "5",
    question: "هل تعاني من مشاكل القلب؟",
    name: "heart_problems"
  },
  {
    id: "6",
    question: "هل لديك ارتفاع في ضغط الدم؟",
    name: "high_blood_pressure"
  },
  {
    id: "7",
    question: "هل تعاني من مرض السكري؟",
    name: "diabetes"
  },
  {
    id: "8",
    question: "هل انت حامل ( للنساء)؟",
    name: "pregnant"
  },
  {
    id: "9",
    question: "هل تدخن؟",
    name: "smokes"
  },
  {
    id: "10",
    question: "أخرى",
    name: "others"
  }
]
