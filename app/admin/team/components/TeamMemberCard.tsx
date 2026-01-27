'use client';

import { User, Mail, Phone, Briefcase, MoreVertical } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  designation?: string;
  is_active: boolean;
  daily_lead_capacity: number;
}

interface TeamMemberCardProps {
  member: TeamMember;
  onUpdate: () => void;
}

export function TeamMemberCard({ member, onUpdate }: TeamMemberCardProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'manager':
        return 'bg-blue-100 text-blue-700';
      case 'agent':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{member.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
              {member.role}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${member.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="h-4 w-4" />
          <span>{member.email}</span>
        </div>
        
        {member.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{member.phone}</span>
          </div>
        )}
        
        {member.department && (
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="h-4 w-4" />
            <span>{member.department}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Capacity: {member.daily_lead_capacity}/day
        </span>
        <span className={member.is_active ? 'text-green-600' : 'text-gray-400'}>
          {member.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
}