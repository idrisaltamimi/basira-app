import { useNavigate } from "react-router-dom"

import { FaFileSignature } from "react-icons/fa6"

import type { OpenVisits } from "@/lib/types"
import { calculateAge, formatDate, surrealDbId } from "@/lib/utils"

import { Button } from "@/components/ui/shadcn/button"

import useVisit from "@/queries/useVisit"
import TableContent from "@/components/ui/TableContent"
import { ColumnDef } from "@tanstack/react-table"
import { OrderByHeader, TooltipWrapper } from "@/components"
import CloseVisit from "./CloseVisit"
import { useQueryClient } from "@tanstack/react-query"
import ProtectedElement from "@/components/ProtectedElement"

export default function WaitingRoom() {
  const { getVisits } = useVisit()

  return (
    <div>
      <h1>غرفة الانتظار</h1>
      <hr />
      <TableContent data={getVisits.data ?? []} filter={false} columns={columns} />
    </div>
  )
}

const columns: ColumnDef<OpenVisits>[] = [
  {
    accessorKey: "visitor_name",
    header: "الاسم",
    cell: ({ row }) => <div>{row.getValue("visitor_name")}</div>
  },
  {
    accessorKey: "visitor_birthdate",
    header: "العمر",
    cell: ({ row }) => <div>{calculateAge(row.getValue("visitor_birthdate"))}</div>
  },
  {
    accessorKey: "visitor_phone",
    header: "رقم الهاتف",
    cell: ({ row }) => <div>{row.getValue("visitor_phone")}</div>
  },
  {
    accessorKey: "visitor_file_number",
    header: ({ column }) => {
      return <OrderByHeader column={column}>رقم الملف</OrderByHeader>
    },
    cell: ({ row }) => {
      return <div>{row.getValue("visitor_file_number")}</div>
    }
  },
  {
    accessorKey: "created_at",
    header: "وقت الزيارة",
    cell: ({ row }) => {
      return <div>{formatDate(row.getValue("created_at"), "time")}</div>
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const visit = row.original

      return (
        <div className="flex items-center gap-4 mr-auto">
          <ProtectedElement allowedRoles={["مدير", "معالج"]}>
            <OpenVisitorFile visitorId={surrealDbId(visit.visitor_id)} />
          </ProtectedElement>
          {/* <AddPayment visit={visit} /> */}
          <CloseVisit visit={visit} />
        </div>
      )
    }
  }
]

function OpenVisitorFile({ visitorId }: { visitorId: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return (
    <TooltipWrapper content="ملف الزائر">
      <Button
        variant={"ghost"}
        size={"icon"}
        className="hover:text-primary"
        onClick={async () => {
          await queryClient.setQueryData(["visitorId"], visitorId)
          await localStorage.setItem("visitorId", visitorId)
          navigate("/dashboard/visitor-file")
        }}
      >
        <FaFileSignature className="text-xl" />
      </Button>
    </TooltipWrapper>
  )
}
