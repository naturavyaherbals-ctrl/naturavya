'use client';

import { AddTeamMemberForm } from '../components/AddTeamMemberForm';
import { useRouter } from 'next/navigation';

export default function AddTeamMemberPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Add Team Member
          </h1>
          
          <AddTeamMemberForm 
            onSuccess={() => {
              alert('Team member added successfully!');
              router.push('/admin/team');
            }}
            onClose={() => router.back()}
          />
        </div>
      </div>
    </div>
  );
}