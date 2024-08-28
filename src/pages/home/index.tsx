import type { NavLinkType } from "@/lib/types"

import { Link, Outlet, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/shadcn/button"
import { cn } from "@/lib/utils"

export default function Home() {
  const location = useLocation()

  const active = (pathname: string) => location.pathname === `/dashboard/home/${pathname}`

  const currentNestedPath = () => {
    const pathSegments = location.pathname.split("/")
    const lastSegments = pathSegments[pathSegments.length - 1]
    switch (lastSegments) {
      case "statics":
        return "الاحصائيات"
      case "payments":
        return "حسابات الزائرين"
      default:
        return ""
    }
  }

  return (
    <>
      <ul className="flex items-center text-sm">
        <NavLink active={active("statics")} to="statics">
          الاحصائيات
        </NavLink>
        <NavLink active={active("visits")} to="visits">
          الزيارات
        </NavLink>
        <NavLink active={active("payments")} to="payments">
          المحاسبات
        </NavLink>
      </ul>
      <div className="mt-4 text-xs">
        <span className="text-muted-foreground">لوحة التحكم</span> / {currentNestedPath()}
      </div>
      <Outlet />
    </>
  )
}

function NavLink({ children, to, active }: NavLinkType) {
  return (
    <li className="flex">
      <Button
        asChild
        variant="link"
        className={cn(
          "relative justify-start w-full text-foreground no-underline",
          active && "underline underline-offset-8 decoration-4 text-primary"
        )}
        size="sm"
      >
        <Link to={`/dashboard/home/${to}`}>{children}</Link>
      </Button>
    </li>
  )
}
