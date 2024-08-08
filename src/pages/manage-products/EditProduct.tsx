import { ChangeEvent, FormEvent, useState } from "react"
import { FaEdit } from "react-icons/fa"

import { surrealDbId } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn/button"
import { useProduct } from "@/queries"
import { Modal, RadioInput, TextField, TooltipWrapper } from "@/components"
import { Product } from "@/types/prodcut"
import { Label } from "@/components/ui/shadcn/label"

type EditProductProps = {
  product: Product
}

export default function EditProduct({ product }: EditProductProps) {
  const { updateProduct } = useProduct()
  const [formData, setFormData] = useState(product as Product)
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (e: ChangeEvent) => {
    const { name, value } = e.target as HTMLInputElement

    if (name === "status") {
      setFormData((prev) => ({ ...prev, [name]: value === "true" }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const { id, amount, ...rest } = formData
    updateProduct.mutate(
      {
        ...rest,
        id: surrealDbId(id),
        amount: parseFloat(amount.toString())
      },
      {
        onSuccess: () => {
          setIsOpen(false)
        }
      }
    )
  }

  return (
    <Modal
      title={`قم بتعديل ${product.product_name}`}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <TooltipWrapper content="عدل المنتج">
          <Button size={"sm"} variant={"secondary"} className="flex items-center gap-4">
            <FaEdit />
          </Button>
        </TooltipWrapper>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-4 mt-2">
          <Label>حالة المنتج:</Label>
          <RadioInput
            label="متوفر"
            id="inStock"
            name="status"
            value={"true"}
            checked={formData.status}
            onChange={handleChange}
          />
          <RadioInput
            label="غير متورفر"
            id="outOfStock"
            name="status"
            value={"false"}
            checked={!formData.status}
            onChange={handleChange}
          />
        </div>

        <TextField
          label="اسم المنتج"
          id="product_name"
          name="product_name"
          value={formData.product_name}
          onChange={handleChange}
        />

        <TextField
          label="سعر المنتج"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
        />

        <div className="flex gap-6 mt-4">
          <Button className="basis-full">احفظ</Button>
          <Button
            variant={"secondary"}
            className="basis-full"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            أغلق
          </Button>
        </div>
      </form>
    </Modal>
  )
}
