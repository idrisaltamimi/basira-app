import { formatCurrency, surrealDbId } from "@/lib/utils"
import { usePayment, useVisit } from "@/queries"
import { Button } from "@/components/ui/shadcn/button"
import { FormEvent, useState } from "react"
import { Label } from "@/components/ui/shadcn/label"
import { Modal, TextField } from "@/components"
import { Product } from "@/types/product"
import { NewPayment } from "@/types/payment"
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
import { FaMinus } from "react-icons/fa6"

type ProductsSummaryProps = {
  addedProducts: Product[]
  setAddedProducts: React.Dispatch<React.SetStateAction<Product[]>>
  setFilteredProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

type FormData = {
  payment_method: "كاش" | "فيزا"
  name: string
  discount: string
  payedAmount: string
}

const INITIAL_DATA: FormData = {
  payment_method: "فيزا",
  name: "buyer",
  discount: "",
  payedAmount: ""
}

export default function ProductsSummary({
  addedProducts,
  setAddedProducts,
  setFilteredProducts
}: ProductsSummaryProps) {
  const { getVisits } = useVisit()
  const { createProductPayments } = usePayment()
  const [formData, setFormData] = useState(INITIAL_DATA)
  const [open, setOpen] = useState(false)

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const data: NewPayment = {
      payment_type: "payment",
      name: "مشتري",
      category: "products",
      pending: formData.name === "buyer" ? false : true,
      visit_id: formData.name === "buyer" ? "visit:buyer" : formData.name,
      amount:
        formData.discount === ""
          ? parseFloat(paymentSum(addedProducts).toFixed(3))
          : parseFloat(
              calculateNewTotal(
                paymentSum(addedProducts),
                parseInt(formData.discount)
              ).newTotalValue.toFixed(3)
            ),
      payment_method: formData.payment_method
    }

    const itemsData = addedProducts.map((item) => ({
      name: item.product_name,
      amount: item.amount
    }))

    const updatedProducts = Object.values(groupedProducts).map(({ product, count }) => ({
      product_id: surrealDbId(product.id),
      count: count
    }))

    createProductPayments.mutate(
      {
        paymentData: data,
        paymentItems: {
          visit_id: formData.name === "buyer" ? "visit:buyer" : formData.name,
          items: itemsData
        },
        updatedProducts: updatedProducts
      },
      {
        onSuccess: () => {
          setOpen(false)
        }
      }
    )

    setAddedProducts([])
  }

  const removeProduct = (product: Product) => {
    setAddedProducts((prevProducts) => {
      const index = prevProducts.findIndex(
        (item) => surrealDbId(item.id) === surrealDbId(product.id)
      )
      if (index > -1) {
        setFilteredProducts((prev) =>
          prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1, status: item.quantity + 1 > 0 }
              : item
          )
        )
        return [...prevProducts.slice(0, index), ...prevProducts.slice(index + 1)]
      }
      return prevProducts
    })
  }

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
      <div className="flex items-center w-full gap-4 mt-3">
        {formData.name === "buyer" && (
          <div className="flex items-end gap-2">
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
            <p className="flex items-center font-bold h-11">%</p>
          </div>
        )}

        {formData.payment_method === "كاش" && (
          <div className="flex items-end gap-2 ">
            <TextField
              label="المبلغ المدفوع"
              name="payedAmount"
              value={formData.payedAmount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, payedAmount: e.target.value }))
              }
              type="number"
              className="basis-full"
            />
            <p className="flex items-center font-bold h-11">ر.ع</p>
          </div>
        )}
      </div>

      <table className="w-full mt-10">
        <thead>
          <tr className="border-b-[1px]">
            <th className="py-4 text-start">اسم المنتج</th>
            <th className="py-4 text-start">السعر</th>
            <th className="py-4 text-start">الكمية</th>
            <th className="py-4 text-start">الإجمالي</th>
            <th className="py-4 text-start"></th>
          </tr>
        </thead>
        <tbody>
          {Object.values(groupedProducts).map(({ product, count }) => (
            <tr key={surrealDbId(product.id)}>
              <td className="py-4">{product.product_name}</td>
              <td className="py-4">{formatCurrency(product.amount)}</td>
              <td className="py-4">{count}</td>
              <td className="py-4">{formatCurrency(product.amount * count)}</td>
              <td className="py-4">
                <Button
                  onClick={() => removeProduct(product)}
                  size={"icon"}
                  variant={"destructive"}
                  className="w-6 h-6 rounded-sm"
                  aria-label="remove-item"
                >
                  <FaMinus />
                </Button>
              </td>
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
            <th className="py-4 text-start"></th>
          </tr>
          {formData.payment_method === "كاش" && (
            <tr className="w-full">
              <th className="text-start" colSpan={3}>
                المبلغ المتبقي
              </th>
              <th className="text-start">
                {!isNaN(parseFloat(formData.payedAmount)) && (
                  <div className="text-destructive">
                    {formData.discount === ""
                      ? formatCurrency(
                          -(paymentSum(addedProducts) - parseFloat(formData.payedAmount))
                        )
                      : formatCurrency(
                          -(
                            calculateNewTotal(
                              paymentSum(addedProducts),
                              parseInt(formData.discount)
                            ).newTotalValue - parseFloat(formData.payedAmount)
                          )
                        )}
                  </div>
                )}
              </th>
            </tr>
          )}
        </tfoot>
      </table>
      <Modal
        title={"إنهاء المحاسبة"}
        description={"هل تريد إنهاء وحفظ المحاسبة"}
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button disabled={addedProducts.length <= 0} fullWidth>
            أرسل
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="flex gap-6 mt-6">
          <Button fullWidth>نعم</Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setOpen(false)}
            type="button"
          >
            لا
          </Button>
        </form>
      </Modal>
    </div>
  )
}
