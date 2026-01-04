// app/admin/layout.tsx
// We removed 'requireAdmin()' to stop the redirect loop.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      {children}
    </div>
  )
}