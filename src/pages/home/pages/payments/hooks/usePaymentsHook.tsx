import { useCallback, useEffect, useState } from "react"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import usePayment from "@/queries/usePayment"
import { columns } from "./columns"
import { Payment } from "@/types/payment"
import { invoke } from "@tauri-apps/api/tauri"
import { MAX_VISIBLE_PAGES, PAGE_SIZE } from "@/constants"

export function usePaymentsHook() {
  const {
    getPaymentsCount: { data: count }
  } = usePayment()

  const [pageIndex, setPageIndex] = useState(0)
  const [data, setData] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<
    "all" | "products" | "salaries" | "visits" | "expenses"
  >("all")
  const [refetch, setRefetch] = useState(false)

  const totalNumberOfPages = Math.ceil((count?.count ?? 0) / PAGE_SIZE)
  const currentPage = pageIndex + 1

  const getPayments = useCallback(
    async (pageIndex: number) => {
      setIsFetching(true)
      try {
        const res: Payment[] = await invoke("get_payments", {
          pending: false,
          pageIndex,
          pageSize: PAGE_SIZE,
          category: filter === "all" ? null : filter
        })
        setData(res)
      } catch (error) {
        console.error(error)
        setIsError(true)
        setError("An error occurred!")
      } finally {
        setIsFetching(false)
        setIsLoading(false)
        setIsError(false)
      }
    },
    [filter]
  ) // Only recreate this function when `filter` changes

  const debouncedGetPayments = useCallback(debounce(getPayments, 500), [getPayments])

  useEffect(() => {
    debouncedGetPayments(pageIndex)
    setRefetch(false)
  }, [pageIndex, filter, refetch])

  const table = useReactTable({
    data: data,
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
    setRefetch,
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

const debounce = <T extends any[]>(callback: (...args: T) => void, wait: number) => {
  let timeoutId: number | null = null

  return (...args: T) => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => {
      callback(...args)
    }, wait)
  }
}
