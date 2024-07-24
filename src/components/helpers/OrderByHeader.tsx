import { ReactNode } from "react"
import { Column } from "@tanstack/react-table"

import { Button } from "../ui/shadcn/button"
import { ArrowUpDown } from "lucide-react"

type OrderByHeaderProps = {
  children: ReactNode
  column: Column<any, unknown>
}

export default function OrderByHeader({ children, column }: OrderByHeaderProps) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="px-0 font-bold rounded-none"
    >
      {children}
      <ArrowUpDown className="w-4 h-4 ml-2" />
    </Button>
  )
}
