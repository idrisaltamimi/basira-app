import { FormEvent, useState } from "react"
import { FaTrash } from "react-icons/fa6"

import { surrealDbId } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn/button"
import { useProduct } from "@/hooks"
import { Modal, TooltipWrapper } from "@/components"
import { SurrealDbId } from "@/lib/types"

export default function DeleteProduct({ productId }: { productId: SurrealDbId }) {
  const { deleteProduct } = useProduct()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    deleteProduct.mutate(surrealDbId(productId), {
      onSuccess: () => {
        setIsOpen(false)
      }
    })
  }

  return (
    <Modal
      title={"حذف المنتج"}
      description={"هل أنت متأكدأنك تريد حذف هذا المنتج؟"}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <TooltipWrapper content=" احذف المنتج">
          <Button
            size={"icon"}
            variant={"destructive"}
            className="flex items-center gap-4 bg-destructive/90"
          >
            <FaTrash />
          </Button>
        </TooltipWrapper>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex gap-6 mt-4">
          <Button className="basis-full" variant={"destructive"}>
            احذف
          </Button>
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
