import { FormEvent, useState } from "react"
import { FaUserLargeSlash } from "react-icons/fa6"

import { useVisit } from "@/queries"
import { surrealDbId } from "@/lib/utils"
import { Modal, TooltipWrapper } from "@/components"
import { Button } from "@/components/ui/shadcn/button"
import type { OpenVisits } from "@/lib/types"

export default function CloseVisit({ visit }: { visit: OpenVisits }) {
  const { deleteVisit } = useVisit()

  const [dialogOpen, setDialogOpen] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    deleteVisit.mutate(surrealDbId(visit.id), {
      onSuccess: () => {
        setDialogOpen(false)
      }
    })
  }

  return (
    <Modal
      title="هل أنت متأكد أنك تريد إغلاق الزبارة"
      redTitle
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      trigger={
        <TooltipWrapper content="إغلاق الزيارة">
          <Button size="icon" variant="ghost" className="hover:text-destructive">
            <FaUserLargeSlash className="text-xl" />
          </Button>
        </TooltipWrapper>
      }
    >
      <form onSubmit={onSubmit} className="flex items-stretch gap-2">
        <Button
          fullWidth
          variant={"destructive"}
          type="submit"
          disabled={deleteVisit.isPending}
        >
          إغلاق
        </Button>
        <Button
          fullWidth
          variant={"secondary"}
          type="button"
          onClick={() => setDialogOpen(false)}
          disabled={deleteVisit.isPending}
        >
          إلغاء
        </Button>
      </form>
    </Modal>
  )
}
