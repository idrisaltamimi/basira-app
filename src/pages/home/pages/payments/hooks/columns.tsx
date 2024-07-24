import { ColumnDef } from "@tanstack/react-table"
import { FaArrowDown, FaArrowUp } from "react-icons/fa6"
import { MdDeleteSweep } from "react-icons/md"
import { Payment } from "@/types/payment"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import DeletePayment from "@/components/helpers/DeletePayment"

export const columns: ColumnDef<Payment>[] = [
  {
    id: "index",
    header: "العدد",
    cell: ({ row }) => row.index + 1
  },
  {
    accessorKey: "name",
    header: "الاسم",
    cell: ({ row }) => (
      <div>
        {getPaymentName(row.getValue("name") === "" ? "مشتري" : row.getValue("name"))}
      </div>
    )
  },
  {
    accessorKey: "visitor_phone",
    header: "رقم الهاتف",
    cell: ({ row }) => <div>{row.getValue("visitor_phone")}</div>
  },
  {
    accessorKey: "category",
    header: "نوع المحاسبة",
    cell: ({ row }) => <div>{getPaymentType(row.getValue("category"))}</div>
  },
  {
    accessorKey: "created_at",
    header: "تاريخ الدفع",
    cell: ({ row }) => <div>{formatDate(row.getValue("created_at"), "full")}</div>
  },
  {
    accessorKey: "amount",
    header: "المبلغ",
    cell: ({ row }) => {
      const paymentType: string = row.original.payment_type
      return (
        <div
          className={cn(
            "font-semibold flex items-center gap-2",
            paymentType === "spending" ? "text-destructive" : "text-success"
          )}
        >
          {paymentType === "spending" ? (
            <FaArrowDown className="text-destructive" />
          ) : (
            <FaArrowUp className="text-success" />
          )}
          {formatCurrency(parseFloat(row.getValue("amount")))}
        </div>
      )
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return (
        <div className="flex justify-end w-full">
          <DeletePayment paymentId={payment.id}>
            <MdDeleteSweep className="text-2xl" />
          </DeletePayment>
        </div>
      )
    }
  }
]

const getPaymentType = (paymentType: string) => {
  switch (paymentType) {
    case "salaries":
      return "راتب"
    case "products":
      return "شراء منتجات"
    case "visits":
      return "مرتبط بالزيارة"
    case "expenses":
      return "مصروفات"
    default:
      return paymentType
  }
}

const getPaymentName = (name: string) => {
  switch (name) {
    case "شهري":
      return `راتب ${name}`
    case "يومي":
      return `راتب ${name}`
    default:
      return name
  }
}
