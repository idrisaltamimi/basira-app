import { ColumnDef } from "@tanstack/react-table"

import { User } from "@/types/user"
import { useUser } from "@/queries"
import { AddSalaryForm } from "./AddSalaryForm"
import { AddUser } from "./AddUser"
import { Badge } from "@/components/ui/shadcn/badge"
import { OrderByHeader, TableContent } from "@/components"

import UpdateUserStatus from "./UpdateUserStatus"
import { calculateAge, formatDate } from "@/lib/utils"

export default function EmployeeList() {
  const { usersData } = useUser()

  return (
    <TableContent data={usersData.data ?? []} columns={columns} searchId="phone">
      <AddUser />
    </TableContent>
  )
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "الاسم",
    cell: ({ row }) => <div>{row.getValue("name")}</div>
  },
  {
    accessorKey: "birthdate",
    header: "العمر",
    cell: ({ row }) => <div>{calculateAge(row.getValue("birthdate"))}</div>
  },
  {
    accessorKey: "gender",
    header: ({ column }) => {
      return <OrderByHeader column={column}>الجنس</OrderByHeader>
    },
    cell: ({ row }) => <div>{row.getValue("gender")}</div>
  },
  {
    accessorKey: "email",
    header: "البريد الالكتوني",
    cell: ({ row }) => <div>{row.getValue("email")}</div>
  },
  {
    accessorKey: "phone",
    header: "رقم الهاتف",
    cell: ({ row }) => {
      return <div>{row.getValue("phone")}</div>
    }
  },
  {
    accessorKey: "role",
    header: "المنصب",
    cell: ({ row }) => {
      return <div>{row.getValue("role")}</div>
    }
  },
  {
    accessorKey: "login_at",
    header: "تسجيل الدخول",
    cell: ({ row }) => {
      const date = row.getValue("login_at")
      return <div>{date == null ? "______" : formatDate(date as string, "full")}</div>
    }
  },
  {
    accessorKey: "logout_at",
    header: "تسجيل الخروج",
    cell: ({ row }) => {
      const date = row.getValue("logout_at")
      return <div>{date == null ? "______" : formatDate(date as string, "full")}</div>
    }
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => {
      return <OrderByHeader column={column}>حالة الحساب</OrderByHeader>
    },
    cell: ({ row }) => {
      const isActive = row.getValue("is_active")
      return (
        <Badge variant={isActive ? "active" : "destructive"} className={`text-white `}>
          {isActive ? "مفعل" : "معطل"}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const isActive = row.original.is_active
      const id = `user:${row.original.id.id.String}`
      const name = row.original.name

      return (
        <div className="flex items-center gap-4">
          <AddSalaryForm userId={id} userName={name} />
          <UpdateUserStatus isActive={isActive} id={id} name={name} />
        </div>
      )
    }
  }
]
