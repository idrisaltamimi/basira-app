import { SurrealDbId } from "@/lib/types"

export type Visit = {
  id: SurrealDbId
  created_at: string
  visitor_id: SurrealDbId
  visitor_name: string
  visitor_birthdate: string
  visitor_file_number: number
  visitor_phone: number
  treatment_img?: string
  description?: string
  treatment_type?: string
  doctor_name?: string
  doctor_id?: SurrealDbId
  prescription?: string
  treatment_cost?: number
  prescription_cost?: number
  symptoms?: string
}
