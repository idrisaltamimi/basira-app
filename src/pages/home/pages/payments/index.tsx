import { flexRender } from "@tanstack/react-table"

import { createArray } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/shadcn/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/shadcn/pagination"
import AddSpending from "./AddSpending"
import { usePaymentsHook } from "./hooks/usePaymentsHook"
import { RadioInput } from "@/components"
import { ChangeEvent } from "react"

export default function Payments() {
  const {
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
  } = usePaymentsHook()

  const handleChange = (e: ChangeEvent) => {
    const { value, name } = e.target as HTMLInputElement
    setFilter((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="w-full">
      <div className="mt-2">
        <AddSpending />
        <div className="flex items-center gap-4 mt-4 mb-2">
          <RadioInput
            label="الكل"
            id="all_data"
            name="time"
            value="all"
            checked={filter.time === "all"}
            onChange={handleChange}
            small
          />
          <RadioInput
            label="اليوم"
            id="today"
            name="time"
            value="today"
            checked={filter.time === "today"}
            onChange={handleChange}
            small
          />
          <RadioInput
            label="الأمس"
            id="yesterday"
            name="time"
            value="yesterday"
            checked={filter.time === "yesterday"}
            onChange={handleChange}
            small
          />
          <RadioInput
            label="الشهر الحالي"
            id="month"
            name="time"
            value="month"
            checked={filter.time === "month"}
            onChange={handleChange}
            small
          />
          <RadioInput
            label="الشهر الماضي"
            id="last_month"
            name="time"
            value="last_month"
            checked={filter.time === "last_month"}
            onChange={handleChange}
            small
          />
        </div>
        <div className="flex items-center gap-4 mt-4 mb-2">
          <RadioInput
            label="الكل"
            id="all_categories"
            name="category"
            value="all"
            checked={filter.category === "all"}
            onChange={handleChange}
            small
          />
          <RadioInput
            label="المنتجات"
            id="products"
            name="category"
            value="products"
            checked={filter.category === "products"}
            onChange={handleChange}
            small
          />
          <RadioInput
            label="الرواتب"
            id="salaries"
            name="category"
            value="salaries"
            checked={filter.category === "salaries"}
            onChange={handleChange}
            small
          />
          <RadioInput
            label="الزيارات"
            id="visits"
            name="category"
            value="visits"
            checked={filter.category === "visits"}
            onChange={handleChange}
            small
          />
          <RadioInput
            label="المصروفات"
            id="expenses"
            name="category"
            value="expenses"
            checked={filter.category === "expenses"}
            onChange={handleChange}
            small
          />
        </div>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader className="w-full">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="flex items-center justify-start"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="w-full h-24 text-center">
                  تحميل البيانات...
                </TableCell>
              </TableRow>
            ) : isError ? (
              error && <div>حدث خطأ ما!</div>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="flex items-center justify-start basis-full"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="w-full h-24 text-center">
                  تحميل البيانات...
                </TableCell>
              </TableRow>
            )}
            {data?.length === 0 && (
              <TableRow className="py-6 text-2xl font-semibold text-center text-muted-foreground">
                <TableCell>لا توجد محاسبات</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end py-4 space-x-2">
        <div className="flex items-center gap-2 space-x-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={handlePrevious} />
              </PaginationItem>
              {startPage > 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              {createArray(endPage - startPage + 1, startPage).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={() => handlePage(page)}
                    isActive={page === pageIndex + 1}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {endPage < totalNumberOfPages && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext href="#" onClick={handleNext} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
