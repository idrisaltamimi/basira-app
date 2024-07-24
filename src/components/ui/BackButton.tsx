import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { IoChevronForwardCircle } from "react-icons/io5"

import { Header } from ".."
import { Button } from "./shadcn/button"

export default function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  const navigateTo = () =>
    location.pathname.includes("home") ? navigate("/") : navigate(-1)

  return (
    <div>
      <Header />
      <Button
        variant={"outline"}
        size={"sm"}
        className="flex items-center gap-2 mt-4 mr-6 text-xs font-semibold text-muted-foreground w-fit hover:text-primary focus-visible:text-primary"
        onClick={() => navigateTo()}
      >
        <IoChevronForwardCircle className="text-2xl" />
        عد للوراء
      </Button>
      <div className="p-10">
        <Outlet />
      </div>
    </div>
  )
}
