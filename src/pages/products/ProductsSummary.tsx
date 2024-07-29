import { formatCurrency, surrealDbId } from "@/lib/utils"
import { usePayment, useVisit } from "@/hooks"
import { Button } from "@/components/ui/shadcn/button"
import { FormEvent, useState } from "react"
import { Label } from "@/components/ui/shadcn/label"
import { Notification, TextField } from "@/components"
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
} from "@/components/ui/shadcn/select"

type ProductsSummaryProps = {
  addedProducts: Product[]
  setAddedProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

type FormData = {
  payment_method: "كاش" | "فيزا"
  name: string
  discount: string
}

const INITIAL_DATA: FormData = {
  payment_method: "فيزا",
  name: "buyer",
  discount: ""
}

export default function ProductsSummary({
  addedProducts,
  setAddedProducts
}: ProductsSummaryProps) {
  const { getVisits } = useVisit()
  const { createProductPayments } = usePayment()
  const [formData, setFormData] = useState(INITIAL_DATA)

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

  const calculateNewTotal = (total: number, discount: number) => {
    const discountAmount = total * (discount / 100)
    const newTotalValue = total - discountAmount
    return {
      newTotalValue: newTotalValue,
      discountAmount: discountAmount
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const data: ProductPayment = {
      payment_type: "payment",
      name: "شراء منتجات",
      category: "products",
      pending: formData.name === "buyer" ? false : true,
      visit_id: formData.name === "buyer" ? "visit:buyer" : formData.name,
      amount: parseFloat(paymentSum(addedProducts).toFixed(3)),
      payment_method: formData.payment_method
    }

    createProductPayments.mutate(data, {
      onSuccess: () => {
        setAddedProducts([])
      }
    })
  }
  // createProductPayments
  return (
    <div className="basis-2/3">
      <h2>المحاسبة</h2>
      <hr />
      <Label className="block">الحساب لــ</Label>
      <Select
        onValueChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
      >
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
      {formData.name === "buyer" && (
        <div className="flex items-end gap-2 mt-3 w-80">
          <TextField
            label="كوبون"
            name="discount"
            value={formData.discount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, discount: e.target.value }))
            }
            type="number"
            className="basis-full"
          />
          <p className="flex items-center font-bold basis-full h-11">%</p>
        </div>
      )}

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
            <th className="py-4 text-start" colSpan={formData.name === "buyer" ? 2 : 3}>
              المجموع
            </th>
            {formData.name === "buyer" && (
              <th className="py-4 text-start">
                <Select
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_method: value as "كاش" | "فيزا"
                    }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="فيزا" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="فيزا">فيزا</SelectItem>
                      <SelectItem value="كاش">كاش</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </th>
            )}
            <th className="py-4 text-start">
              {formData.discount === ""
                ? formatCurrency(paymentSum(addedProducts))
                : formatCurrency(
                    calculateNewTotal(
                      paymentSum(addedProducts),
                      parseInt(formData.discount)
                    ).newTotalValue
                  )}
            </th>
          </tr>
        </tfoot>
      </table>
      <form onSubmit={handleSubmit}>
        <Button disabled={addedProducts.length <= 0}>أرسل</Button>
      </form>
      {createProductPayments.isSuccess && (
        <Notification message="تم إضافة المنتج بنجاح" />
      )}
      {createProductPayments.isError && <Notification message="حدث خطأ!" error />}
    </div>
  )
}
