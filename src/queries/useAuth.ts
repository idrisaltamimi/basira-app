import { toast } from "@/components/ui/use-toast"
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
        throw new Error(error as string)
      }
    },
    onSuccess: async (data) => {
      if (data) {
        await queryClient.setQueryData(["userData"], data as User)
        navigate("/")
      }
    },
    onError: () => {
      toast({
        title: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive"
      })
    }
  })

  const signOut = useMutation({
    mutationFn: async (userId: string) => {
      try {
        const res = await invoke("signout", { userId })
        return res
      } catch (error) {
        throw new Error(error as string)
      }
    },
    onSuccess: async () => {
      queryClient.setQueryData(["userData"], {})
      navigate("/auth")
    },
    onError: () => {
      toast({
        title: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive"
      })
    }
  })

  const signUp = useMutation({
    mutationFn: async (data: signupData) => {
      const res: User = await invoke("signup", { data })
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get_users"] })
    },
    onError: () => {
      toast({
        title: "حدث خطأ أثناء صنع الحساب",
        variant: "destructive"
      })
    }
  })

  return { signIn, signOut, signUp }
}
