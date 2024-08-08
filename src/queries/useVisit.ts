import { toast } from "@/components/ui/use-toast"
import { OpenVisits, SurrealDbId } from "@/lib/types"
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
        console.log(error)
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
        console.error("Error closing visit:", error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_visits"] })
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
        const res = await invoke("update_visit", { data })
        return res
      } catch (error) {
        console.error(error)
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
        console.error("Error getting last visit:", error)
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