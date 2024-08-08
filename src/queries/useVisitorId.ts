import { useQueryClient } from "@tanstack/react-query"

export default function useVisitorId() {
  const queryClient = useQueryClient()

  const setVisitorId = (visitorId: string) => {
    queryClient.setQueryData(["visitorId"], visitorId)
  }

  const getVisitorId = (): string => {
    return queryClient.getQueryData(["visitorId"]) ?? ""
  }

  return { setVisitorId, getVisitorId }
}
