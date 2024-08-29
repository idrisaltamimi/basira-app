import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/shadcn/table"
import { useVisitsHook } from "./hooks/useVisitsHook"
import { RadioInput } from "@/components"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/shadcn/pagination"
import { flexRender } from "@tanstack/react-table"
import { createArray } from "@/lib/utils"

export default function Visits() {
  const {
    table,
    isLoading,
    isFetching,
    isError,
    error,
    columns,
    data,
    filter,
    handleChange,
    handlePage,
    handlePrevious,
    handleNext,
    startPage,
    endPage,
    totalNumberOfPages,
    pageIndex
  } = useVisitsHook()

  return (
    <div className="w-full">
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
      </div>
      <div className="flex items-center gap-4 mt-4 mb-2">
        <RadioInput
          label="الكل"
          id="both_genders"
          name="gender"
          value="all"
          checked={filter.gender === "all"}
          onChange={handleChange}
          small
        />
        <RadioInput
          label="ذكور"
          id="male"
          name="gender"
          value="ذكر"
          checked={filter.gender === "ذكر"}
          onChange={handleChange}
          small
        />
        <RadioInput
          label="إناث"
          id="female"
          name="gender"
          value="أنثى"
          checked={filter.gender === "أنثى"}
          onChange={handleChange}
          small
        />
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
                <TableCell>لا توجد زيارات</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end py-4 space-x-2">
        <div className="flex items-center gap-2 space-x-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem
                className={pageIndex === 0 ? "pointer-events-none opacity-60" : ""}
              >
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
              <PaginationItem
                className={data.length <= 0 ? "pointer-events-none opacity-60" : ""}
              >
                <PaginationNext href="#" onClick={handleNext} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
