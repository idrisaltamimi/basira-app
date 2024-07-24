import { User } from "@/types/user"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"

type UpdateUserStatus = {
  isActive: boolean
  userId: string
}

export default function useUser() {
  const queryClient = useQueryClient()

  const { data: userData } = useQuery<User>({
    queryKey: ["userData"],
    enabled: false // Disable automatic refetching since this data is set elsewhere
  })

  const usersData = useQuery({
    queryKey: ["get_users"],
    queryFn: async () => {
      try {
        const res: User[] = await invoke("get_users")

        return res
      } catch (error) {
        console.log(error)
      }
    }
  })

  const updateUserStatus = useMutation({
    mutationFn: async (data: UpdateUserStatus) => {
      try {
        const res = await invoke("update_user_status", {
          isActive: data.isActive,
          userId: data.userId
        })

        return res
      } catch (error) {
        console.error(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_users"] })
    }
  })

  const updateUser = useMutation({
    mutationFn: async (data: User) => {
      try {
        const res = await invoke("update_user", { data })
        return res
      } catch (error) {
        console.error(error)
      }
    },
    onSuccess: async (data) => {
      if (data) {
        await queryClient.setQueryData(["userData"], data)
      }
    }
  })

  return { userData, usersData, updateUserStatus, updateUser }
}
