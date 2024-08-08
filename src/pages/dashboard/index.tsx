import { Link } from "react-router-dom"
import { MdDashboard, MdOutlineAccessTimeFilled, MdPayments } from "react-icons/md"
import { FaSignOutAlt, FaUserFriends, FaUserEdit, FaUserPlus } from "react-icons/fa"
import { RiFolderHistoryFill } from "react-icons/ri"
import { GiShoppingBag } from "react-icons/gi"
import { IoIosSettings } from "react-icons/io"
import { FaCartPlus } from "react-icons/fa6"

import { useAuth } from "@/queries"
import { Header } from "@/components"
import { Button } from "@/components/ui/shadcn/button"
import logoBg from "../../assets/logo.svg"
import ProtectedElement from "@/components/ProtectedElement"

export default function Dashboard() {
  const { signOut } = useAuth()

  return (
    <div className="relative min-h-full">
      <Header />
      <main className="relative flex items-center justify-center h-full min-h-[calc(100vh-80px)]">
        <nav className="w-full h-full py-4 mt-10 max-w-[1000px] mx-auto pb-20 z-50">
          <ul className="flex flex-wrap items-center justify-center gap-12">
            <NavLink to="new-visitor">
              <FaUserPlus className="text-5xl" />
              <span>زائر جديد</span>
            </NavLink>

            <NavLink to="old-visitor">
              <FaUserEdit className="text-5xl" />
              <span>زائر سابق</span>
            </NavLink>

            <NavLink to="waiting-room">
              <MdOutlineAccessTimeFilled className="text-5xl" />
              <span>الانتظار</span>
            </NavLink>

            <NavLink to="pending-payments">
              <MdPayments className="text-5xl" />
              <span>الحسابات</span>
            </NavLink>

            <NavLink to="products">
              <GiShoppingBag className="text-5xl" />
              <span>المنتجات</span>
            </NavLink>

            <ProtectedElement allowedRoles={["مدير"]}>
              <NavLink to="manage-products">
                <FaCartPlus className="text-5xl" />
                <span>إدارة المنتجات</span>
              </NavLink>
            </ProtectedElement>

            <ProtectedElement allowedRoles={["مدير", "معالج"]}>
              <NavLink to="visit-history">
                <RiFolderHistoryFill className="text-5xl" />
                <span>تاريخ الزيارات</span>
              </NavLink>
            </ProtectedElement>

            <ProtectedElement allowedRoles={["مدير"]}>
              <NavLink to="users">
                <FaUserFriends className="text-5xl" />
                <span>إدارة الموظفين</span>
              </NavLink>
            </ProtectedElement>

            <ProtectedElement allowedRoles={["مدير"]}>
              <NavLink to="home/statics">
                <MdDashboard className="text-5xl" />
                <span>لوحة التحكم</span>
              </NavLink>
            </ProtectedElement>

            <NavLink to="settings">
              <IoIosSettings className="text-5xl" />
              <span>الإعدادات</span>
            </NavLink>
          </ul>
        </nav>
        <img
          src={logoBg}
          alt=""
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none h-full left-1/2 top-1/2 aspect-square object-fit opacity-[6%]"
        />
      </main>
      <Button
        className="absolute flex flex-col items-center justify-center w-32 h-24 gap-2 font-semibold shadow-2xl text-black/70 text-md rounded-3xl left-12 bottom-12 bg-destructive/5 hover:bg-destructive hover:text-white"
        variant={"destructive"}
        onClick={signOut}
        size="lg"
      >
        <FaSignOutAlt className="text-2xl" />
        <span>تسجيل الخروج</span>
      </Button>
    </div>
  )
}

type NavLinkProps = {
  children: React.ReactNode
  to: string
}

function NavLink({ children, to }: NavLinkProps) {
  return (
    <li className="relative flex w-48 mt-4">
      <Button
        asChild
        variant={"secondary"}
        className="w-48 h-40 text-xl font-semibold shadow-2xl rounded-3xl hover:bg-primary hover:text-white focus-visible:bg-primary focus-visible:text-white focus-visible:ring-0 backdrop-blur-[6px]"
        size="lg"
      >
        <Link
          to={`/dashboard/${to}`}
          className="flex flex-col items-center justify-center w-full gap-4"
        >
          {children}
        </Link>
      </Button>
    </li>
  )
}
