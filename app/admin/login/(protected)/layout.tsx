import type { ReactNode } from "react"
import { requireAdmin } from "@/lib/admin-auth"
import AdminShell from "./admin-shell"
 
export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {

  return <AdminShell>{children}</AdminShell>
}