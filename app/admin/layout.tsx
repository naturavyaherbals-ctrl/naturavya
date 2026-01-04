import AdminShell from "./admin-shell"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // This wraps EVERY admin page with your Sidebar & Header
    <AdminShell>
      {children}
    </AdminShell>
  )
}