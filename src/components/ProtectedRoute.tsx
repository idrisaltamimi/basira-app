import { Navigate } from "react-router-dom"
import { ComponentType, Suspense } from "react"
import { useUser } from "@/hooks"

type ProtectedRouteProps = {
  Component: ComponentType
  roles: string[] | "all"
}

export default function ProtectedRoute({ Component, roles }: ProtectedRouteProps) {
  const { userData } = useUser()

  if (!userData) return <Navigate to="/auth" replace />
  else if (roles === "all") return <Load Component={Component} />
  else if (roles.includes(userData.role)) return <Load Component={Component} />
  else return <Navigate to="/" replace />
}

type LoadProps = {
  Component: ComponentType
}

const Load: React.FC<LoadProps> = ({ Component }) => {
  return (
    <Suspense fallback="loading...">
      <Component />
    </Suspense>
  )
}
