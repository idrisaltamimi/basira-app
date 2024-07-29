import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

type VisitorData = {
  birthdate: string
  phone: number
  civil_id?: number
  name: string
  gender: string
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

  return { createNewVisit, createVisitor }
}
