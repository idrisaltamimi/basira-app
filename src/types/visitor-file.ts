import { SurrealDbId } from "../lib/types"

export type MedicalHistory = {
  did_surgery: string | undefined
  has_disease: string | undefined
  use_medicine: string | undefined
  allergy: string | undefined
  heart_problems: string | undefined
  high_blood_pressure: string | undefined
  diabetes: string | undefined
  pregnant: string | undefined
  smokes: string | undefined
  others: string | undefined
}

export interface Record extends MedicalHistory {
  id: SurrealDbId
}
