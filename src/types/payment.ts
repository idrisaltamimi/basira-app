import { SurrealDbId } from "../lib/types"

export type NewPayment = {
  payment_type: "spending" | "payment"
  name: string
  category: "products" | "salaries" | "visits" | "expenses"
  amount: string
  pending: boolean
  visit_id: string
}

export type Payment = {
  amount: number
  created_at: string
  id: SurrealDbId
  visit_id: SurrealDbId
  payment_type: "spending" | "payment"
  name: string
  category: "products" | "salaries" | "visits" | "expenses"
  visitor_name: string
  visitor_phone: string
}

export type ProductPayment = {
  payment_type: "spending" | "payment"
  name: string
  category: "products" | "salaries" | "visits" | "expenses"
  amount: number
  pending: boolean
  visit_id: string
}
