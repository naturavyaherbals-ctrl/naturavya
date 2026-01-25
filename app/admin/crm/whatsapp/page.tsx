'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Phone,
  User,
  Clock,
  Search,
  Filter,
  Settings,
  Plus,
  CheckCheck,
  Check,
  AlertCircle,
} from 'lucide-react';
import { formatRelativeTime, formatPhoneNumber } from '@/lib/utils/formatters';
import { useRealtime } from '@/lib/hooks/useRealtime';

interface Conversation {
  id: string;
  contact_phone: string;
  contact_name: string | null;
  status: string;
  unread_count: number;
  last_message_text: string | null;
  last_message_type: string | null;
  last_message_direction: string | null;
  last_message_at: string | null;
  window_expires_at: string | null;
  whatsapp_account: {
    id: string;
    name: string;
    phone_number: string;
  };
  lead: {
    id: string;
    full_name: string;
    status: string;
  } | null;
  assigned_team_member: {
    id: string;
    user: {
      full_name: string;
    };
  } | null;
}

export default function WhatsAppInboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [accounts, setAccounts] = useState<any[]>([]);

  // Realtime updates
  useRealtime({
    table: 'whatsapp_conversations',
    onInsert: () => fetchConversations(),
    onUpdate: () => fetchConversations(),
  });

  useRealtime({
    table: 'whatsapp_messages',
    onInsert: () => fetchConversations(),
  });

  useEffect(() => {
    fetchAccounts();
    fetchConversations();
  }, [statusFilter, selectedAccountId]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/admin/whatsapp/accounts');
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (selectedAccountId) params.set('accountId', selectedAccountId);
      if (search) params.set('search', search);

      const response = await fetch(`/api/admin/whatsapp/conversations?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchConversations();
  };

  const getStatusIcon = (conversation: Conversation) => {
    if (conversation.last_message_direction === 'outbound') {
      const lastMessage = conversation.last_message_text;
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    }
    return null;
  };

  const isWindowOpen = (conversation: Conversation) => {
    if (!conversation.window_expires_at) return false;
    return new Date(conversation.window_expires_at) > new Date();
  };

  // Stats
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const openConversations = conversations.filter(c => c.status === 'open').length;
  const pendingConversations = conversations.filter(c => c.status === 'pending').length;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Inbox</h1>
          <p className="text-gray-600 mt-1">
            {totalUnread > 0 && <span className="text-green-600 font-medium">{totalUnread} unread • </span>}
            {openConversations} open conversations
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/crm/whatsapp/settings"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600">Total Conversations</p>
          <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600">Unread Messages</p>
          <p className="text-2xl font-bold text-green-600">{totalUnread}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600">Open Chats</p>
          <p className="text-2xl font-bold text-blue-600">{openConversations}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingConversations}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by phone or name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </form>

          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.phone_number})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No conversations found</p>
          </div>
        ) : (
          <div className="divide-y overflow-y-auto max-h-[calc(100vh-400px)]">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/admin/crm/whatsapp/${conversation.id}`}
                className={`block p-4 hover:bg-gray-50 transition-colors ${
                  conversation.unread_count > 0 ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {conversation.contact_name || formatPhoneNumber(conversation.contact_phone)}
                        </p>
                        {!isWindowOpen(conversation) && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            Template only
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {conversation.last_message_at
                          ? formatRelativeTime(conversation.last_message_at)
                          : 'No messages'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(conversation)}
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message_text || 'No messages yet'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {conversation.lead && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {conversation.lead.full_name}
                        </span>
                      )}
                      {conversation.assigned_team_member && (
                        <span>
                          Assigned: {conversation.assigned_team_member.user.full_name}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full ${
                        conversation.status === 'open'
                          ? 'bg-green-100 text-green-700'
                          : conversation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {conversation.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}