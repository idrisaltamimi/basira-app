import { ChangeEvent, FormEvent, useState } from "react"
import { FaCartPlus } from "react-icons/fa6"

import { Button } from "@/components/ui/shadcn/button"
import { useProduct } from "@/queries"
import { Modal, TextField } from "@/components"

export default function AddProduct() {
  const { createProduct } = useProduct()
  const [formData, setFormData] = useState({ product_name: "", amount: "" })
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

    const { amount, ...rest } = formData
    createProduct.mutate(
      {
        ...rest,
        amount: parseFloat(amount.toString()),
        status: true
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
      title={"أضف منتج جديد"}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button size={"sm"} variant={"secondary"} className="flex items-center gap-4">
          <FaCartPlus />
          <span>أضف منتج</span>
        </Button>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
