import { toast } from "@/components/ui/use-toast"
import { OpenVisits, SurrealDbId } from "@/lib/types"
import { escapeBackslashes } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

export type LatestVisit = {
  id: SurrealDbId
  created_at: string
  name: string
}

type updateVisit = {
  treatment_img: string
  description: string
  treatment_type: string
  prescription: string
  symptoms: string
  treatment_cost: number
  prescription_cost: number
  doctor: string
  visit_id: string
}

type LastVisitsHistory = {
  id: SurrealDbId
  created_at: string
}

export default function useVisit() {
  const queryClient = useQueryClient()

  const getVisits = useQuery({
    queryKey: ["get_visits"],
    queryFn: async () => {
      try {
        const data: OpenVisits[] = await invoke("get_visits")
        return data
      } catch (error) {
        toast({
          title: "حدث خطأ ما!",
          variant: "destructive"
        })
      }
    }
  })

  const getLatestVisits = useQuery({
    queryKey: ["latest_visit"],
    queryFn: async () => {
      try {
        const res: LatestVisit[] = await invoke("latest_visit")

        return res
      } catch (error) {
        console.log(error)
      }
    }
  })

  const closeOpenVisit = useMutation({
    mutationFn: async (visitId: string) => {
      try {
        const res = await invoke("close_visit", { visitId })
        return res
      } catch (error) {
        throw new Error(error as string)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_visits"] })
    },
    onError: () => {
      toast({
        title: "حدث خطأ عند إنهاء الزيارة",
        variant: "destructive"
      })
    }
  })

  const deleteVisit = useMutation({
    mutationFn: async (visitId: string) => {
      try {
        const res = await invoke("delete_visit", { visitId })
        return res
      } catch (error) {
        throw new Error(error as string)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_visits"] })
      toast({
        title: "تم إلغاء الزيارة بنجاح"
      })
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ ما",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const updateVisit = useMutation({
    mutationFn: async (data: updateVisit) => {
      try {
        console.log(data.treatment_img)
        const res = await invoke("update_visit", {
          data: {
            ...data,
            description: escapeBackslashes(data.description),
            treatment_type: escapeBackslashes(data.treatment_type),
            prescription: escapeBackslashes(data.prescription),
            symptoms: escapeBackslashes(data.symptoms)
          }
        })
        return res
      } catch (error) {
        console.log(error)
        throw new Error(error as string)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_visit"] })
      toast({
        title: "تم حفظ الزيارة بنجاح"
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "!حدث خطأ ما! حاول مرة أخرى"
      })
    }
  })

  const getVisitsHistory = useQuery({
    queryKey: ["get_visits_history"],
    queryFn: async () => {
      const visitorId = localStorage.getItem("visitorId")
      try {
        const res: LastVisitsHistory[] = await invoke("get_visits_history", {
          visitorId
        })
        return res
      } catch (error) {
        toast({
          title: "حدث خطأ ما!",
          variant: "destructive"
        })
      }
    }
  })

  return {
    getVisits,
    getLatestVisits,
    closeOpenVisit,
    updateVisit,
    getVisitsHistory,
    deleteVisit
  }
}
