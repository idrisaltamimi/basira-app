import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

type VisitorData = {
  birthdate: string
  phone: number
  civil_id?: number
  name: string
  gender: string
}

type UpdateVisitorData = {
  id: String
  name: String
  phone: number
  civil_id?: number
  gender: String
  birthdate: Date
  file_number: number
}

export default function useVisitor() {
  const queryClient = useQueryClient()

  const createVisitor = useMutation({
    mutationFn: async (data: VisitorData) => {
      try {
        const res = await invoke("create_visitor", { data })
        return res
      } catch (error) {
        throw new Error(error as string)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_visits", "get_unpaid_payments"] })
    }
  })

  const updateVisitor = useMutation({
    mutationFn: async (data: UpdateVisitorData) => {
      try {
        const res = await invoke("update_visitor", { data })
        return res
      } catch (error) {
        throw new Error(error as string)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "get_visitor",
          "get_visitors",
          "get_visits_history",
          "get_selected_visit"
        ]
      })
    }
  })

  const createNewVisit = useMutation({
    mutationFn: async (visitorId: string) => {
      try {
        await invoke("create_visit", {
          visitorId
        })
      } catch (error) {
        console.error(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_visits"] })
    }
  })

  return { createNewVisit, createVisitor, updateVisitor }
}
