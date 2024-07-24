import { SurrealDbId } from "../lib/types"

export type Salary = {
  id: SurrealDbId
  created_at: string
  user_name: String
  user_phone: String
  amount: number
  salary_type: "daily" | "monthly"
}
