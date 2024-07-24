import { useUser } from "@/hooks"
import { getInitials } from "@/lib/utils"
import logo from "../../assets/logo.png"

export default function Header() {
  const { userData } = useUser()

  return (
    <header className="flex items-center justify-between h-20 px-6">
      <img src={logo} alt="" height={80} className="h-16" />
      <div className="flex items-center gap-2">
        <span className="text-base font-medium">{userData?.name}</span>
        <div className="grid font-bold text-white rounded-full w-11 h-11 bg-primary place-items-center">
          {getInitials(userData?.name ?? "")}
        </div>
      </div>
    </header>
  )
}
