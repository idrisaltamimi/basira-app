import { MedicalHistory } from "@/types/visitor-file"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

type CreateRecord = {
  newRecord: MedicalHistory
  visitorId: string
}

export default function useRecord() {
  const queryClient = useQueryClient()

  const createRecord = useMutation({
    mutationFn: async ({ newRecord, visitorId }: CreateRecord) => {
      try {
        const res = await invoke("create_record", {
          data: { ...newRecord, visitor_id: visitorId }
        })
        return res
      } catch (error) {
        console.log(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_record"] })
    }
  })

  const updateRecord = useMutation({
    mutationFn: async ({ newRecord, visitorId }: CreateRecord) => {
      try {
        const res = await invoke("update_record", {
          data: { ...newRecord, visitor_id: visitorId }
        })
        return res
      } catch (error) {
        console.log(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_record"] })
    }
  })

  return { createRecord, updateRecord }
}
