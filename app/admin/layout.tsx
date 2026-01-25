import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/Sidebar'; // THIS IMPORT MUST MATCH
import { AdminHeader } from '@/components/admin/Header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch full user profile
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userData || !['super_admin', 'admin', 'manager', 'agent'].includes(userData.role)) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar user={userData} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader user={userData} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}