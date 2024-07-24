import { formatCurrency, surrealDbId } from "@/lib/utils"
import { usePayment, useVisit } from "@/hooks"
import { Button } from "@/components/ui/shadcn/button"
import { FormEvent, useState } from "react"
import { Label } from "@/components/ui/shadcn/label"
import { Notification } from "@/components"
import { Product } from "@/types/prodcut"
import { ProductPayment } from "@/types/payment"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

type ProductsSummaryProps = {
  addedProducts: Product[]
  setAddedProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

export default function ProductsSummary({
  addedProducts,
  setAddedProducts
}: ProductsSummaryProps) {
  const { getVisits } = useVisit()
  const { createProductPayments } = usePayment()

  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)

  const groupedProducts = addedProducts.reduce(
    (acc: { [key: string]: { product: Product; count: number } }, product) => {
      if (!acc[surrealDbId(product.id)]) {
        acc[surrealDbId(product.id)] = { product, count: 1 }
      } else {
        acc[surrealDbId(product.id)].count += 1
      }
      return acc
    },
    {}
  )

  const paymentSum = (values: Product[]) =>
    values.reduce((acc, cur) => acc + cur.amount, 0)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setIsSuccess(false)
    setIsError(false)

    const data: ProductPayment = {
      payment_type: "payment",
      name: "مشتري",
      category: "products",
      pending: false,
      visit_id: "visit:buyer",
      amount: parseFloat(paymentSum(addedProducts).toFixed(3))
    }

    createProductPayments.mutate(data, {
      onSuccess: () => {
        setIsSuccess(true)
        setAddedProducts([])
      },
      onError: () => {
        setIsError(false)
      }
    })
  }
  // createProductPayments
  return (
    <div className="basis-full">
      <h2>المحاسبة</h2>
      <hr />
      <Label className="block">الحساب لــ</Label>
      <Select>
        <SelectTrigger className="h-11">
          <SelectValue placeholder="مشتري" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="buyer">مشتري</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>الزائرين</SelectLabel>
            {getVisits.data?.map((visit) => (
              <SelectItem key={visit.id.id.String} value={surrealDbId(visit.id)}>
                {visit.visitor_name} - {visit.visitor_phone}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <table className="w-full mt-10">
        <thead>
          <tr className="border-b-[1px]">
            <th className="py-4 text-start">اسم المنتج</th>
            <th className="py-4 text-start">السعر</th>
            <th className="py-4 text-start">الكمية</th>
            <th className="py-4 text-start">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(groupedProducts).map(({ product, count }) => (
            <tr key={surrealDbId(product.id)}>
              <td className="py-4">{product.product_name}</td>
              <td className="py-4">{formatCurrency(product.amount)}</td>
              <td className="py-4">{count}</td>
              <td className="py-4">{formatCurrency(product.amount * count)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="w-full border-t-[1px]">
            <th className="py-4 text-start" colSpan={3}>
              المجموع
            </th>
            <th className="py-4 text-start">
              {formatCurrency(paymentSum(addedProducts))}
            </th>
          </tr>
        </tfoot>
      </table>
      <form onSubmit={handleSubmit}>
        <Button disabled={addedProducts.length <= 0}>أرسل</Button>
      </form>
      {isSuccess && <Notification message="تم إضافة الحساب بنجاح" />}
      {isError && <Notification message="حدث خطأ!" />}
    </div>
  )
}
