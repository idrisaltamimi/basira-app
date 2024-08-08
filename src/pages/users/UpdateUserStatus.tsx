import { TooltipWrapper } from "@/components"
import Modal from "@/components/ui/Modal"
import { Button } from "@/components/ui/shadcn/button"
import { useUser } from "@/queries"
import { useState } from "react"
import { FaUserLarge, FaUserLargeSlash } from "react-icons/fa6"

type UpdateUserStatusProps = {
  isActive: boolean
  name: string
  id: string
}

export default function UpdateUserStatus({ isActive, name, id }: UpdateUserStatusProps) {
  const { updateUserStatus } = useUser()
  const [dialogOpen, setDialogOpen] = useState(false)

  const userStatus = isActive ? "تعطيل" : "تفعيل"

  const handleClick = async () => {
    updateUserStatus.mutate(
      {
        isActive: isActive ? false : true,
        userId: id
      },
      {
        onSuccess: () => {
          setDialogOpen(false)
        }
      }
    )
  }

  return (
    <Modal
      title={`${userStatus} حساب الموظف`}
      description={`هل أنت متأكد أنك تريد ${userStatus} حساب ${name}`}
      redTitle={isActive}
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      trigger={
        <TooltipWrapper content={isActive ? "قم بتعطيل الحساب" : "قم بتفعيل الحساب"}>
          <Button
            size={"icon"}
            variant={"ghost"}
            className={isActive ? "hover:text-destructive" : "hover:text-success"}
          >
            {isActive ? (
              <FaUserLargeSlash className="text-xl" />
            ) : (
              <FaUserLarge className="text-xl" />
            )}
          </Button>
        </TooltipWrapper>
      }
    >
      <div className="flex items-stretch gap-2">
        <Button
          fullWidth
          variant={isActive ? "destructive" : "default"}
          onClick={handleClick}
        >
          {userStatus}
        </Button>
        <Button fullWidth variant={"secondary"} onClick={() => setDialogOpen(false)}>
          إلغاء
        </Button>
      </div>
    </Modal>
  )
}
