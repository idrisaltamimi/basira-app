import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { SurrealDbId } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FORMATE THE DATA
export const formatDate = (date: string, type: "full" | "date" | "time") => {
  const dateTime = new Date(date)

  const segments = new Intl.DateTimeFormat("ar-TN", {
    dateStyle: "short",
    timeStyle: "short"
  })
    .format(dateTime)
    .split("، ")

  const today = () => new Date()
  const yesterday = () => {
    let d = new Date()
    d.setDate(d.getDate() - 1)
    return d
  }

  // check if the day is today or yesterday
  switch (dateTime.toISOString().split("T")[0]) {
    case today().toISOString().split("T")[0]:
      segments[0] = "اليوم"
      break
    case yesterday().toISOString().split("T")[0]:
      segments[0] = "الأمس"
      break
  }

  switch (type) {
    case "full":
      return segments.join("، ")
    case "date":
      return segments[0]
    case "time":
      return segments[1]
  }
}

// GET THE INITIALS OF A NAME
export function getInitials(name: string) {
  if (!name) return
  // const initials = name
  //   .split(" ")
  //   .map((part) => (part[0] ? part[0].toUpperCase() : ""))
  //   .join("")
  return name[0]
}

// FORMAT CURRENCY TO OMANI RIAL BUT IN ARABIC NUMBERS
export function formatCurrency(amount: number) {
  const formatted = new Intl.NumberFormat("ar-TN", {
    style: "currency",
    currency: "OMR"
  }).format(amount)

  return formatted
}

// FORMAT SURREALDB ID
export function surrealDbId(id: SurrealDbId | undefined) {
  if (!id) return ""
  const table = id.tb
  const idStr = id.id.String
  return `${table}:${idStr}`
}

// CALCULATE AGE
export const calculateAge = (birthdate: string): number => {
  const birthday = new Date(birthdate)
  const today = new Date()
  let age = today.getFullYear() - birthday.getFullYear()
  const m = today.getMonth() - birthday.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
    age--
  }

  return age
}

// Create An Array of Page Numbers
export function createArray(length: number, startAt: number = 1) {
  return Array.from({ length }, (_, index) => index + startAt)
}

// Check If number is valid
export function isValidNumber(input: any): input is number {
  // First, ensure the input is neither null nor undefined
  if (input === null || input === undefined) {
    return false
  }

  // Convert the input to a number using the Number constructor
  // This will not throw an error for invalid numbers, instead it returns NaN
  const number = Number(input)

  // Check if the converted number is finite and not NaN
  return Number.isFinite(number) && !Number.isNaN(number)
}
