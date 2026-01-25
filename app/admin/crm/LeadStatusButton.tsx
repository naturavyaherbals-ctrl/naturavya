'use client';

// =====================================================
// LEAD STATUS BUTTONS - QUICK STATUS CHANGE
// =====================================================

import React, { useState } from 'react';
import {
  PhoneOff,
  Clock,
  ThumbsUp,
  Flame,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PhoneForwarded,
  Ban,
  Star,
} from 'lucide-react';
import type { LeadStatus } from '@/types';
import { LEAD_STATUS_CONFIG } from '@/types';

interface LeadStatusButtonsProps {
  leadId: string;
  currentStatus: LeadStatus;
  onStatusChange: (leadId: string, status: LeadStatus, notes?: string) => void;
  compact?: boolean;
  showAll?: boolean;
}

interface StatusButton {
  status: LeadStatus;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  hoverColor: string;
}

const STATUS_BUTTONS: StatusButton[] = [
  {
    status: 'not_picked',
    label: 'Not Picked',
    shortLabel: 'NP',
    icon: <PhoneOff className="w-3.5 h-3.5" />,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    hoverColor: 'hover:bg-gray-200',
  },
  {
    status: 'callback_requested',
    label: 'Callback',
    shortLabel: 'CB',
    icon: <PhoneForwarded className="w-3.5 h-3.5" />,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    hoverColor: 'hover:bg-yellow-200',
  },
  {
    status: 'follow_up',
    label: 'Follow Up',
    shortLabel: 'FU',
    icon: <Clock className="w-3.5 h-3.5" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    hoverColor: 'hover:bg-orange-200',
  },
  {
    status: 'interested',
    label: 'Interested',
    shortLabel: 'INT',
    icon: <ThumbsUp className="w-3.5 h-3.5" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    hoverColor: 'hover:bg-purple-200',
  },
  {
    status: 'hot_lead',
    label: 'Hot Lead',
    shortLabel: 'HOT',
    icon: <Flame className="w-3.5 h-3.5" />,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    hoverColor: 'hover:bg-red-200',
  },
  {
    status: 'order_confirmed',
    label: 'Confirmed',
    shortLabel: 'ORD',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    hoverColor: 'hover:bg-green-200',
  },
  {
    status: 'not_interested',
    label: 'Not Interested',
    shortLabel: 'NI',
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    hoverColor: 'hover:bg-gray-200',
  },
  {
    status: 'wrong_number',
    label: 'Wrong No.',
    shortLabel: 'WN',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    hoverColor: 'hover:bg-red-200',
  },
  {
    status: 'dnd',
    label: 'DND',
    shortLabel: 'DND',
    icon: <Ban className="w-3.5 h-3.5" />,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    hoverColor: 'hover:bg-red-200',
  },
];

export default function LeadStatusButtons({
  leadId,
  currentStatus,
  onStatusChange,
  compact = false,
  showAll = false,
}: LeadStatusButtonsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState<LeadStatus | null>(null);
  const [noteText, setNoteText] = useState('');

  // Get allowed next statuses based on current status
  const allowedStatuses = showAll 
    ? STATUS_BUTTONS.map(b => b.status)
    : LEAD_STATUS_CONFIG[currentStatus]?.nextSteps || [];

  const visibleButtons = STATUS_BUTTONS.filter(
    button => allowedStatuses.includes(button.status) || button.status === currentStatus
  );

  const handleStatusClick = async (status: LeadStatus) => {
    if (status === currentStatus || isUpdating) return;

    // For certain statuses, ask for notes
    if (['not_interested', 'cancelled', 'wrong_number', 'dnd'].includes(status)) {
      setShowNoteModal(status);
      return;
    }

    setIsUpdating(true);
    await onStatusChange(leadId, status);
    setIsUpdating(false);
  };

  const handleNoteSubmit = async () => {
    if (!showNoteModal) return;

    setIsUpdating(true);
    await onStatusChange(leadId, showNoteModal, noteText);
    setIsUpdating(false);
    setShowNoteModal(null);
    setNoteText('');
  };

  if (compact) {
    return (
      <>
        <div className="flex flex-wrap gap-1">
          {/* Current Status Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            LEAD_STATUS_CONFIG[currentStatus]?.bgColor || 'bg-gray-100'
          } ${LEAD_STATUS_CONFIG[currentStatus]?.color || 'text-gray-700'}`}>
            {LEAD_STATUS_CONFIG[currentStatus]?.label || currentStatus}
          </span>

          {/* Quick Change Dropdown */}
          <div className="relative group">
            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
              <Star className="w-3.5 h-3.5" />
            </button>
            <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border p-2 hidden group-hover:block z-50 min-w-[160px]">
              <p className="text-xs text-gray-500 mb-2 px-2">Change Status</p>
              {visibleButtons.map((button) => (
                <button
                  key={button.status}
                  onClick={() => handleStatusClick(button.status)}
                  disabled={isUpdating || button.status === currentStatus}
                  className={`
                    w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium text-left transition-all
                    ${button.bgColor} ${button.color} ${button.hoverColor}
                    ${button.status === currentStatus ? 'ring-2 ring-offset-1 ring-gray-300' : ''}
                    ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {button.icon}
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Note Modal */}
        {showNoteModal && (
          <NoteModal
            status={showNoteModal}
            noteText={noteText}
            setNoteText={setNoteText}
            onSubmit={handleNoteSubmit}
            onClose={() => {
              setShowNoteModal(null);
              setNoteText('');
            }}
            isUpdating={isUpdating}
          />
        )}
      </>
    );
  }

  // Full button display
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {visibleButtons.map((button) => (
          <button
            key={button.status}
            onClick={() => handleStatusClick(button.status)}
            disabled={isUpdating}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${button.bgColor} ${button.color} ${button.hoverColor}
              ${currentStatus === button.status ? 'ring-2 ring-offset-1 ring-gray-400 shadow-sm' : ''}
              ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {button.icon}
            <span className="hidden sm:inline">{button.label}</span>
            <span className="sm:hidden">{button.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <NoteModal
          status={showNoteModal}
          noteText={noteText}
          setNoteText={setNoteText}
          onSubmit={handleNoteSubmit}
          onClose={() => {
            setShowNoteModal(null);
            setNoteText('');
          }}
          isUpdating={isUpdating}
        />
      )}
    </>
  );
}

// =====================================================
// NOTE MODAL
// =====================================================

function NoteModal({
  status,
  noteText,
  setNoteText,
  onSubmit,
  onClose,
  isUpdating,
}: {
  status: LeadStatus;
  noteText: string;
  setNoteText: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isUpdating: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          Add Note for "{LEAD_STATUS_CONFIG[status]?.label || status}"
        </h3>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note about why this status was selected..."
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          autoFocus
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isUpdating}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}