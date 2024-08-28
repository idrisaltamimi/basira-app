import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { ColumnDef } from "@tanstack/react-table"
import { calculateAge, formatDate, surrealDbId } from "@/lib/utils"
import DeleteForm from "@/components/form/DeleteForm"
import { MdDeleteSweep } from "react-icons/md"
import { invoke } from "@tauri-apps/api/tauri"
import { SurrealDbId } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"
import { useVisit } from "@/queries"
import { ChangeEvent, useEffect, useState } from "react"

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
  const [filter, setFilter] = useState({ time: "today", gender: "all" })
  const [filteredData, setFilteredData] = useState<VisitDetails[]>()

  const { deleteVisitById } = useVisit()
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["get_today_visits", filter.time],
    queryFn: async () => {
      try {
        const res: VisitDetails[] = await invoke("get_today_visits", {
          filter: filter.time
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
      accessorKey: "doctor_name",
      header: "المعالج",
      cell: ({ row }) => <div>{row.getValue("doctor_name")}</div>
    },
    {
      accessorKey: "created_at",
      header: "وقت الزيارة",
      cell: ({ row }) => <div>{formatDate(row.getValue("created_at"), "time")}</div>
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
            <span className="text-success">مفتوحة</span>
          ) : (
            <span>مغلقة</span>
          )}
        </div>
      )
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const visit = row.original
        const deleteVisit = () => deleteVisitById.mutate(surrealDbId(visit.id))
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

  return {
    table,
    isLoading,
    isFetching,
    isError,
    error,
    columns,
    data: filteredData ?? [],
    handleChange,
    filter
  }
}
