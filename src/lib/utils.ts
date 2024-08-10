import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { SurrealDbId } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FORMATE THE DATA
export function formatDate(dateString: string, type: "full" | "date" | "time"): string {
  const date = new Date(dateString)
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)

  const isToday = date.toDateString() === now.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  const optionsDate: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  }

  const formattedDate = date.toLocaleDateString("ar-EG", optionsDate)
  const formattedTime = date.toLocaleTimeString("ar-EG", optionsTime)

  if (isToday) {
    if (type === "full") {
      return `اليوم، ${formattedTime}`
    }
    if (type === "date") {
      return "اليوم"
    }
    if (type === "time") {
      return formattedTime
    }
  }

  if (isYesterday) {
    if (type === "full") {
      return `الأمس، ${formattedTime}`
    }
    if (type === "date") {
      return "الأمس"
    }
    if (type === "time") {
      return formattedTime
    }
  }

  if (type === "full") {
    return `${formattedDate}، ${formattedTime}`
  }
  if (type === "date") {
    return formattedDate
  }
  if (type === "time") {
    return formattedTime
  }

  return ""
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

export function escapeBackslashes(input: string): string {
  return input.replace(/\\/g, "\\\\")
}
