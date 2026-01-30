import { Lead, UserRole } from '@/types/crm';
import { cn } from '@/utils/cn';
import {
  Phone,
  MessageCircle,
  Edit3,
  ShoppingCart,
  User,
  Flame,
  Snowflake,
  Sun,
  Star,
  Clock,
} from 'lucide-react';

interface LeadHeaderProps {
  lead: Lead;
  userRole: UserRole;
  onEditLead: () => void;
  onCreateOrder: () => void;
  onWhatsAppClick: () => void;
  onCallClick: () => void;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-purple-100 text-purple-700 border-purple-200',
  qualified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  negotiation: 'bg-amber-100 text-amber-700 border-amber-200',
  won: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-red-100 text-red-700 border-red-200',
  follow_up: 'bg-orange-100 text-orange-700 border-orange-200',
};

const temperatureConfig = {
  hot: { icon: Flame, color: 'text-red-500', bg: 'bg-red-50', label: 'Hot' },
  warm: { icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Warm' },
  cold: { icon: Snowflake, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Cold' },
};

export function LeadHeader({
  lead,
  userRole,
  onEditLead,
  onCreateOrder,
  onWhatsAppClick,
  onCallClick,
}: LeadHeaderProps) {
  const tempConfig = temperatureConfig[lead.temperature] || temperatureConfig.cold;
  const TempIcon = tempConfig.icon;

  const formatPhone = (phone: string) => {
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return phone;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-emerald-600 bg-emerald-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Top gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
      
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left: Lead Info */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {lead.full_name.charAt(0).toUpperCase()}
            </div>
            
            <div className="space-y-2">
              {/* Name and badges */}
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{lead.full_name}</h1>
                
                {/* Status Badge */}
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold border capitalize',
                  statusColors[lead.status] || 'bg-gray-100 text-gray-700'
                )}>
                  {lead.status.replace('_', ' ')}
                </span>
                
                {/* Temperature Badge */}
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5',
                  tempConfig.bg, tempConfig.color
                )}>
                  <TempIcon className="w-3.5 h-3.5" />
                  {tempConfig.label}
                </span>
                
                {/* Score Badge */}
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5',
                  getScoreColor(lead.score)
                )}>
                  <Star className="w-3.5 h-3.5" />
                  Score: {lead.score}
                </span>
              </div>
              
              {/* Phone Numbers */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{formatPhone(lead.phone)}</span>
                </span>
                {lead.alternate_phone && (
                  <span className="text-gray-500">
                    Alt: {formatPhone(lead.alternate_phone)}
                  </span>
                )}
              </div>
              
              {/* Assigned Agent & Last Contact */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {lead.assigned_agent_name && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    Assigned to: <span className="font-medium text-gray-700">{lead.assigned_agent_name}</span>
                  </span>
                )}
                {lead.last_contacted_at && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Last contact: {new Date(lead.last_contacted_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* WhatsApp */}
            <button
              onClick={onWhatsAppClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            
            {/* Call */}
            <button
              onClick={onCallClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4" />
              Call
            </button>
            
            {/* Create Order */}
            <button
              onClick={onCreateOrder}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-medium transition-all shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Create Order
            </button>
            
            {/* Edit Lead */}
            {(userRole === 'manager' || userRole === 'superadmin') && (
              <button
                onClick={onEditLead}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
