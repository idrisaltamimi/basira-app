import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { ColumnDef } from "@tanstack/react-table"
import { calculateAge, formatDate, surrealDbId } from "@/lib/utils"
import DeleteForm from "@/components/form/DeleteForm"
import { MdDeleteSweep } from "react-icons/md"
import { invoke } from "@tauri-apps/api/tauri"
import { SurrealDbId } from "@/lib/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"
import { useVisit } from "@/queries"
import { ChangeEvent, useEffect, useState } from "react"
import { MAX_VISIBLE_PAGES, PAGE_SIZE } from "@/constants"

export type VisitDetails = {
  id: SurrealDbId
  created_at: string
  visitor_id: SurrealDbId
  visitor_name: string
  visitor_birthdate: string
  visitor_phone: string
  visitor_file_number: string
  visitor_gender: string
  doctor_id?: SurrealDbId
  doctor_name?: string
  treatment_type?: string
  is_open: boolean
}

export function useVisitsHook() {
  const [filter, setFilter] = useState({ time: "all", gender: "all" })
  const [filteredData, setFilteredData] = useState<VisitDetails[]>()
  const { deleteVisitById } = useVisit()
  const [pageIndex, setPageIndex] = useState(0)

  const { data: count } = useQuery({
    queryKey: ["get_visits_count"],
    queryFn: async () => {
      try {
        const res: { count: number } = await invoke("get_visits_count")

        return res
      } catch (error) {
        console.error(error)
      }
    }
  })

  const totalNumberOfPages = Math.ceil((count?.count ?? 0) / PAGE_SIZE)
  const currentPage = pageIndex + 1

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["get_filtered_visits", filter, pageIndex],
    queryFn: async () => {
      try {
        const res: VisitDetails[] = await invoke("get_filtered_visits", {
          time: filter.time,
          gender: filter.gender,
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

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setFilter((prev) => ({ ...prev, [name]: value }))
  }

  const columns: ColumnDef<VisitDetails>[] = [
    {
      id: "index",
      header: "العدد",
      cell: ({ row }) => row.index + 1
    },
    {
      accessorKey: "visitor_name",
      header: "الاسم",
      cell: ({ row }) => <div>{row.getValue("visitor_name")}</div>
    },
    {
      accessorKey: "visitor_phone",
      header: "رقم الهاتف",
      cell: ({ row }) => <div>{row.getValue("visitor_phone")}</div>
    },
    {
      accessorKey: "visitor_birthdate",
      header: "العمر",
      cell: ({ row }) => <div>{calculateAge(row.getValue("visitor_birthdate"))}</div>
    },
    {
      accessorKey: "visitor_gender",
      header: "الجنس",
      cell: ({ row }) => <div>{row.getValue("visitor_gender")}</div>
    },
    {
      accessorKey: "doctor_name",
      header: "المعالج",
      cell: ({ row }) => <div>{row.getValue("doctor_name")}</div>
    },
    {
      accessorKey: "created_at",
      header: "وقت الزيارة",
      cell: ({ row }) => <div>{formatDate(row.getValue("created_at"), "full")}</div>
    },
    {
      accessorKey: "treatment_type",
      header: "نوع العلاج",
      cell: ({ row }) => <div>{row.getValue("treatment_type")}</div>
    },
    {
      accessorKey: "is_open",
      header: "حالة الزيارة",
      cell: ({ row }) => (
        <div className="font-bold text-destructive">
          {row.getValue("is_open") ? (
            <span>مفتوحة</span>
          ) : (
            <span className="text-success">مغلقة</span>
          )}
        </div>
      )
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const queryClient = useQueryClient()
        const visit = row.original
        const deleteVisit = () =>
          deleteVisitById.mutate(surrealDbId(visit.id), {
            onSuccess: () => {
              queryClient.refetchQueries({
                queryKey: ["get_visits_count", "get_filtered_visits"]
              })
            }
          })
        return (
          <div className="flex justify-end w-full">
            <DeleteForm title="هل تريد حذف الزيارة" action={deleteVisit}>
              <MdDeleteSweep className="text-2xl" />
            </DeleteForm>
          </div>
        )
      }
    }
  ]

  useEffect(() => {
    const filterData = data?.filter(
      ({ visitor_gender }) => visitor_gender === filter.gender
    )

    if (filter.gender === "all") {
      setFilteredData(data)
    } else {
      setFilteredData(filterData)
    }
  }, [filter, data])

  const table = useReactTable({
    data: filteredData ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel()
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
    data: filteredData ?? [],
    handleChange
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
