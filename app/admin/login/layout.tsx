export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // REMOVED: await requireAdmin()
  // The layout should only handle design, not security.
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
