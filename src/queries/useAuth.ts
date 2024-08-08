import { User } from "@/types/user"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/tauri"
import { useNavigate } from "react-router-dom"

type LoginData = {
  civilId: number
  password: string
}

type signupData = {
  name: string
  password: string
  email: string
  role: "موظف" | "معالج" | "مدير"
  phone: string
  civil_id: number
  birthdate: string
}

export default function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const signIn = useMutation({
    mutationFn: async ({ civilId, password }: LoginData) => {
      try {
        const res: User = await invoke("signin", { civilId, password })
        return res
      } catch (error) {
        console.log(error)
      }
    },
    onSuccess: async (data) => {
      if (data) {
        await queryClient.setQueryData(["userData"], data as User)
        navigate("/")
      }
    }
  })

  const signOut = () => {
    queryClient.setQueryData(["userData"], {})
    navigate("/auth")
  }

  const signUp = useMutation({
    mutationFn: async (data: signupData) => {
      const res: User = await invoke("signup", { data })
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_users"] })
    }
  })

  return { signIn, signOut, signUp }
}
