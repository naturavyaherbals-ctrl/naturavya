// app/admin/layout.tsx

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // REMOVED: await requireAdmin()
  return <>{children}</>
}