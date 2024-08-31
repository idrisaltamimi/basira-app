import { useState } from "react"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import usePayment from "@/queries/usePayment"
import { columns } from "./columns"
import { Payment } from "@/types/payment"
import { invoke } from "@tauri-apps/api/tauri"
import { MAX_VISIBLE_PAGES, PAGE_SIZE } from "@/constants"
import { useQuery } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"

type Filters = {
  category: "all" | "products" | "salaries" | "visits" | "expenses"
  time: string
}

export function usePaymentsHook() {
  const {
    getPaymentsCount: { data: count }
  } = usePayment()

  const [pageIndex, setPageIndex] = useState(0)
  const [filter, setFilter] = useState<Filters>({ category: "all", time: "all" })

  const totalNumberOfPages = Math.ceil((count?.count ?? 0) / PAGE_SIZE)
  const currentPage = pageIndex + 1

  const { data, isLoading, isError, isFetching, error } = useQuery({
    queryKey: ["get_filtered_payments", pageIndex, filter],
    queryFn: async () => {
      try {
        const res: Payment[] = await invoke("get_filtered_payments", {
          category: filter.category,
          time: filter.time,
          pageIndex,
          pageSize: PAGE_SIZE
        })
        return res
      } catch (error) {
        console.error(error)
        toast({
          title: "حدث خطأ ما!",
          variant: "destructive"
        })
      }
    }
  })

  const table = useReactTable({
    data: data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalNumberOfPages,
    state: {
      pagination: {
        pageIndex: 0,
        pageSize: PAGE_SIZE
      }
    }
  })

  const handleNext = () => {
    setPageIndex((old) => old + 1)
    window.scrollTo({ top: 0 })
  }

  const handlePrevious = () => {
    setPageIndex((old) => Math.max(old - 1, 0))
    window.scrollTo({ top: 0 })
  }

  const handlePage = (page: number) => {
    setPageIndex(page - 1)
    window.scrollTo({ top: 0 })
  }

  const { startPage, endPage } = paginationSetup(currentPage, totalNumberOfPages)

  return {
    handlePage,
    handlePrevious,
    handleNext,
    startPage,
    endPage,
    table,
    isLoading,
    isFetching,
    isError,
    error,
    totalNumberOfPages,
    columns,
    pageIndex,
    setFilter,
    filter,
    data
  }
}

const paginationSetup = (currentPage: number, totalNumberOfPages: number) => {
  // Calculate the range of pages to show
  let startPage = Math.max(currentPage - Math.floor(MAX_VISIBLE_PAGES / 2), 1)
  let endPage = Math.min(startPage + MAX_VISIBLE_PAGES - 1, totalNumberOfPages)

  // Adjust start and end page if near the beginning or end of range
  const rangeAdjustment = MAX_VISIBLE_PAGES - (endPage - startPage + 1)
  if (startPage === 1) {
    endPage = Math.min(endPage + rangeAdjustment, totalNumberOfPages)
  } else if (endPage === totalNumberOfPages) {
    startPage = Math.max(startPage - rangeAdjustment, 1)
  }

  return {
    startPage,
    endPage
  }
}
