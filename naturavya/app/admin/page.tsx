import AdminShell from "./admin-shell"

export default function AdminPage() {
  return (
    <AdminShell>
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p>Welcome to the admin panel.</p>
      </div>
    </AdminShell>
  )
}
