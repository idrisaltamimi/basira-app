import { SurrealDbId } from "@/lib/types"

export type Product = {
  id: SurrealDbId
  product_name: string
  amount: number
  status: boolean
}
