import { ComponentType, Suspense, lazy } from "react"
import { Link, Routes, Route } from "react-router-dom"
import ErrorBoundary from "./ErrorBoundary"
import { ProtectedRoute } from "./components"
import { Toaster } from "./components/ui/shadcn/toaster"

const BackButton = lazy(() => import("./components/ui/BackButton"))
const NewVisitor = lazy(() => import("./pages/new-visitor"))
const OldVisitor = lazy(() => import("./pages/old-visitor"))
const WaitingRoom = lazy(() => import("./pages/waiting-room"))
const PendingPayments = lazy(() => import("./pages/pending-payments"))
const Dashboard = lazy(() => import("./pages/dashboard"))
const Home = lazy(() => import("./pages/home"))
const Statics = lazy(() => import("./pages/home/pages/statics"))
const Visits = lazy(() => import("./pages/home/pages/visits"))
const Payments = lazy(() => import("./pages/home/pages/payments"))
const Downloads = lazy(() => import("./pages/home/pages/downloads"))
const VisitorFile = lazy(() => import("./pages/visitor-file"))
const Settings = lazy(() => import("./pages/settings"))
const Users = lazy(() => import("./pages/users"))
const Auth = lazy(() => import("./pages/auth"))
const Products = lazy(() => import("./pages/products"))
const ManageProducts = lazy(() => import("./pages/manage-products"))
const VisitHistory = lazy(() => import("./pages/visit-history"))

export default function App() {
  return (
    <ErrorBoundary fallback={<Link to="/" />}>
      <Suspense fallback={<div>تحميل...</div>}>
        <Routes>
          <Route
            path="/"
            element={<ProtectedRoute roles="all" Component={Dashboard} />}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute roles="all" Component={BackButton} />}
          >
            <Route
              path="home"
              element={<ProtectedRoute roles={["مدير"]} Component={Home} />}
            >
              <Route
                path="statics"
                element={<ProtectedRoute roles={["مدير"]} Component={Statics} />}
              />
              <Route
                path="visits"
                element={<ProtectedRoute roles={["مدير"]} Component={Visits} />}
              />
              <Route
                path="payments"
                element={<ProtectedRoute roles={["مدير"]} Component={Payments} />}
              />
              <Route
                path="downloads"
                element={<ProtectedRoute roles={["مدير"]} Component={Downloads} />}
              />
            </Route>
            <Route
              path="new-visitor"
              element={<ProtectedRoute roles="all" Component={NewVisitor} />}
            />
            <Route
              path="old-visitor"
              element={<ProtectedRoute roles="all" Component={OldVisitor} />}
            />
            <Route
              path="waiting-room"
              element={<ProtectedRoute roles="all" Component={WaitingRoom} />}
            />
            <Route
              path="visitor-file"
              element={
                <ProtectedRoute roles={["مدير", "معالج"]} Component={VisitorFile} />
              }
            />
            <Route
              path="pending-payments"
              element={<ProtectedRoute roles="all" Component={PendingPayments} />}
            />
            <Route
              path="products"
              element={<ProtectedRoute roles="all" Component={Products} />}
            />
            <Route
              path="manage-products"
              element={<ProtectedRoute roles={["مدير"]} Component={ManageProducts} />}
            />
            <Route
              path="settings"
              element={<ProtectedRoute roles="all" Component={Settings} />}
            />
            <Route
              path="users"
              element={<ProtectedRoute roles={["مدير"]} Component={Users} />}
            />
            <Route
              path="visit-history"
              element={
                <ProtectedRoute roles={["مدير", "معالج"]} Component={VisitHistory} />
              }
            />
          </Route>
          <Route path="auth" element={<Load Component={Auth} />} />
          <Route path="*" element={<Link to="/" />} />
        </Routes>
        <Toaster />
      </Suspense>
    </ErrorBoundary>
  )
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
