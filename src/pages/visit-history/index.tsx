import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

import { SurrealDbId, Visitor } from "@/lib/types"
import { formatDate, surrealDbId } from "@/lib/utils"
import { Visit } from "@/types/visit"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/shadcn/select"
import { TextField } from "@/components"
import { Label } from "@/components/ui/shadcn/label"
import VisitFile from "./VisitFile"
import UpdateVisitor from "./UpdateVisitor"
import { toast } from "@/components/ui/use-toast"

type LastVisitsHistory = {
  id: SurrealDbId
  created_at: string
}

type VisitHistory = {
  created_at: string
  description: string
  doctor_name: string
  id: SurrealDbId
  treatment: string
  treatment_img: string
}

export default function VisitHistory() {
  const [searchPhone, setSearchPhone] = useState("")
  const [visitors, setVisitors] = useState<Visitor[] | null>(null)
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null)
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const [visitor, setVisitor] = useState<Visitor>()

  const handleSearch = async (phone: string) => {
    try {
      const data: Visitor[] = await invoke("get_visitors", {
        number: parseInt(phone)
      })
      setVisitors(data)
    } catch (error) {
      toast({
        title: "حدث خطأ ما!",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    if (searchPhone.length < 7) return setVisitors(null)

    const timer = setTimeout(() => {
      setSelectedVisitorId(null)
      setSelectedVisitId(null)
      setVisitor(undefined)
      handleSearch(searchPhone)
    }, 1500)

    return () => clearTimeout(timer)
  }, [searchPhone])

  const { data: visitsHistory } = useQuery<LastVisitsHistory[] | undefined>({
    queryKey: ["get_visits_history", selectedVisitorId],
    queryFn: async () => {
      try {
        const res: LastVisitsHistory[] = await invoke("get_visits_history", {
          visitorId: selectedVisitorId
        })
        return res
      } catch (error) {
        toast({
          title: "حدث خطأ ما!",
          variant: "destructive"
        })
      }
    },
    enabled: !!selectedVisitorId // Only run query if a visitorId is selected
  })

  useEffect(() => {
    if (
      !visitsHistory ||
      visitsHistory.length < 1 ||
      selectedVisitId ||
      !visitors ||
      selectedVisit
    ) {
      return
    }
    setSelectedVisitId(surrealDbId(visitsHistory[0].id))
  }, [visitsHistory])

  const { data: selectedVisit } = useQuery<Visit | undefined>({
    queryKey: ["get_selected_visit", selectedVisitId],
    queryFn: async () => {
      try {
        const res: Visit = await invoke("get_selected_visit", {
          visitId: selectedVisitId
        })
        return res
      } catch (error) {
        toast({
          title: "حدث خطأ ما",
          description: error as string,
          variant: "destructive"
        })
      }
    },
    enabled: !!selectedVisitId // Only run query if a visitorId is selected
  })

  useEffect(() => {
    if (!selectedVisitorId) return
    const getVisitor = async () => {
      try {
        const res: Visitor = await invoke("get_visitor", {
          id: selectedVisitorId
        })
        setVisitor(res)
      } catch (error) {
        toast({
          title: "حدث خطأ ما",
          variant: "destructive"
        })
      }
    }

    getVisitor()
  }, [selectedVisitorId])

  console.log("render")

  return (
    <div>
      <h1>تاريخ الزيارات</h1>
      <hr />
      <div className="flex items-start h-full gap-4">
        <div className="flex flex-col h-full gap-4 basis-1/3">
          <TextField
            label="أدخل رقم هاتف الزائر"
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
          />
          <div>
            {visitors && visitors.length > 0 ? (
              <div>
                <Label>اختر الزائر</Label>
                <Select onValueChange={(value) => setSelectedVisitorId(value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="اختر الزائر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>الزائرين</SelectLabel>
                      {visitors?.map((visitor) => (
                        <SelectItem
                          key={visitor.id.id.String}
                          value={surrealDbId(visitor.id)}
                        >
                          {visitor.name} - {visitor.phone}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              visitors != null && <div>لا يوجد زائر بهذا الرقم</div>
            )}
          </div>

          {visitsHistory && visitsHistory.length > 0 ? (
            <div>
              <Label>حدد الزيارة</Label>
              <Select onValueChange={(value) => setSelectedVisitId(value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="اختر الزيارة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {visitsHistory?.map((visit) => (
                      <SelectItem
                        key={visit.id.id.String}
                        value={surrealDbId(visit.id)}
                        className="py-2"
                      >
                        {formatDate(visit.created_at, "full")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ) : (
            visitsHistory && <div>لا توجد زيارات مسجلة لهذا الزائر</div>
          )}

          <hr />
          {visitor && <UpdateVisitor visitor={visitor} />}
        </div>
        <div className="border-r" />
        <div className="basis-2/3">
          {selectedVisit && <VisitFile visit={selectedVisit} />}
        </div>
      </div>
    </div>
  )
}
