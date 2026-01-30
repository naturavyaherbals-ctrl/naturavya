import { Lead } from '@/types/crm';
import {
  MapPin,
  Globe,
  Target,
  Tag,
  Calendar,
  TrendingUp,
  Edit2,
} from 'lucide-react';

interface LeadInfoPanelProps {
  lead: Lead;
  onEdit: () => void;
}

export function LeadInfoPanel({ lead, onEdit }: LeadInfoPanelProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const fullAddress = [lead.address, lead.city, lead.state, lead.pincode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          Lead Information
        </h2>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Address Section */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Full Address
          </label>
          <p className="text-sm text-gray-900">
            {fullAddress || <span className="text-gray-400 italic">No address provided</span>}
          </p>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Grid Info */}
        <div className="grid grid-cols-2 gap-4">
          {/* Source */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Globe className="w-3 h-3" /> Source
            </label>
            <p className="text-sm font-medium text-gray-900">
              {lead.source || '-'}
            </p>
          </div>

          {/* Campaign */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Target className="w-3 h-3" /> Campaign
            </label>
            <p className="text-sm font-medium text-gray-900">
              {lead.campaign_name || '-'}
            </p>
          </div>

          {/* Created Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Created
            </label>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(lead.created_at)}
            </p>
          </div>

          {/* Score Trend */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Behavior Score
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, lead.score)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900">{lead.score}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <>
            <div className="h-px bg-gray-100" />
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        {lead.notes && (
          <>
            <div className="h-px bg-gray-100" />
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Notes
              </label>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                {lead.notes}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
