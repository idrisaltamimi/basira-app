import { SurrealDbId } from "../lib/types"

export type User = {
  id: SurrealDbId
  name: string
  password: string
  email: string
  role: "موظف" | "معالج" | "مدير"
  phone: number
  civil_id: number
  is_active: boolean
  gender: string
  login_at?: String
  logout_at?: String
  birthdate: string
}

export type UpdateUserData = {
  name: string
  password?: string
  email: string
  phone: string
  birthdate: Date
  id: string
}
