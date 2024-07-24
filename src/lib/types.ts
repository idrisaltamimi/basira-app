export type NavLinkType = {
  children: React.ReactNode
  to: string
  active: boolean
}

export type SurrealDbId = { tb: string; id: { String: string } }

export type FEE = "fee"
export type PRODUCT = "product"
export type VISIT = "visit"
export type MEDICINE = "medicine"

export type Visitor = {
  id: SurrealDbId
  name: string
  phone: string
  civil_id?: number | null
  gender: "ذكر" | "أنثى"
  birthdate: string
  file_number: number
}

export type OpenVisits = {
  id: SurrealDbId
  created_at: string
  visitor_id: SurrealDbId
  visitor_name: string
  visitor_phone: number
  visitor_birthdate: string
  visitor_file_number: number
}
