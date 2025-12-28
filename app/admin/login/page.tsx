import { loginAdmin } from "./actions"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        action={loginAdmin}
        className="bg-white p-8 rounded shadow-md text-center space-y-4"
      >
        <h1 className="text-2xl font-bold">Admin Login</h1>

        {/* TEMP: no email/password yet */}
        <button
          type="submit"
          className="bg-green-700 text-white px-6 py-2 rounded w-full"
        >
          Login as Admin
        </button>
      </form>
    </div>
  )
}
