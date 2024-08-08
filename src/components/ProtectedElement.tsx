import { ReactNode } from "react"
import { useUser } from "@/queries"

type ProtectedElementProps = {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
}

export default function ProtectedElement({
  children,
  allowedRoles,
  fallback = null
}: ProtectedElementProps) {
  const { userData } = useUser()

  const hasAccess = userData && allowedRoles.includes(userData.role)

  return <>{hasAccess ? children : fallback}</>
}
