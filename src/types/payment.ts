import { SurrealDbId } from "../lib/types"

type PaymentType = {
  payment_type: "spending" | "payment"
  payment_method: "كاش" | "فيزا"
  name: string
  category: "products" | "salaries" | "visits" | "expenses"
  amount: number
  visit_id: string | SurrealDbId
}

export type UpdatePaymentData = PaymentType

export type NewPayment = PaymentType & {
  pending: boolean
}

export type Payment = PaymentType & {
  created_at: string
  id: SurrealDbId
  visitor_name: string
  visitor_phone: string
  payment_items: { id: SurrealDbId; amount: number; name: string }[]
}

export type PaymentItem = {
  id: SurrealDbId
  name: string
  amount: number
  visit: SurrealDbId
  payment: SurrealDbId
}

export type PaymentBaseType = {
  amount: number
  category: "products" | "salaries" | "visits" | "expenses"
  created_at: string
  id: SurrealDbId
  name: string
  payment_type: "spending" | "payment"
  payment_method: "كاش" | "فيزا"
  pending: boolean
  visit: SurrealDbId
}
