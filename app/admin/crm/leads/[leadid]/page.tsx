'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Phone,
  MapPin,
  Clock,
  Edit,
  X,
  Save,
  Loader2,
  Package,
  Quote,
  Sparkles,
  CheckCircle,
  Home,
  AlertCircle,
  Copy,
  Check,
  Bot,
  MessageCircle,
  CreditCard,
} from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  // Safe extraction of ID regardless of folder name casing
  const leadId = (params?.leadid || params?.leadId || params?.id) as string;
  
  const supabase = createClient();

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // RTO / WhatsApp / COD states
  const [waSending, setWaSending] = useState(false);
  const [waStatus, setWaStatus] = useState<string | null>(null);

  const [codSending, setCodSending] = useState(false);
  const [codStatus, setCodStatus] = useState<string | null>(null);
  const [codLink, setCodLink] = useState<string | null>(null);

  // Call recording / Whisper states
  const [uploadingCall, setUploadingCall] = useState(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [lastCall, setLastCall] = useState<any | null>(null);

  const fetchLead = async () => {
    if (!leadId) {
      console.error('No leadId found in params');
      return;
    }
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`);
      if (!res.ok) {
        console.error('Failed to fetch lead:', res.status);
        setLead(null);
        return;
      }
      const data = await res.json();
      if (data.lead) setLead(data.lead);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: member } = await supabase
          .from('team_members')
          .select('role')
          .eq('user_id', user.id)
          .single();
        setUserRole(member?.role || 'agent');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const handleQuickUpdate = async (updates: any) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) fetchLead();
    } catch (err) {
      console.error(err);
    }
  };

  // ---- AI HANDLERS ----

  const handleGenerateAi = async () => {
    if (!leadId) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('AI API error:', text);
        throw new Error('Failed to generate AI script');
      }

      const data = await res.json();
      if (data.lead) {
        setLead(data.lead);
      }
    } catch (e: any) {
      console.error(e);
      setAiError(e.message || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyScript = async () => {
    if (!lead?.ai_suggested_message) return;
    try {
      await navigator.clipboard.writeText(lead.ai_suggested_message);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 1500);
    } catch (e) {
      console.error('Clipboard error', e);
    }
  };

  // ---- RTO HANDLERS ----

  const handleSendAddressConfirmWhatsApp = async () => {
    if (!lead?.phone) {
      setWaStatus('Phone number missing.');
      return;
    }

    setWaSending(true);
    setWaStatus(null);

    try {
      const addressLine =
        lead.address && lead.city && lead.state && lead.pincode
          ? `${lead.address}, ${lead.city}, ${lead.state} - ${lead.pincode}`
          : 'your given address';

      const text = `Namaste ${
        lead.full_name || 'ji'
      },\n\nMain Naturavya se bol raha/rahi hoon.\n\nAapka parcel hum is address par bhejne wale hain:\n${addressLine}\n\nKripya WhatsApp par *YES* reply karke confirm kijiye ya sahi address bhej dijiye. Isse delivery time par issue nahi aayega aur RTO avoid hoga.\n\nDhanyavaad,\nTeam Naturavya`;

      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: lead.phone, text }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error('WA address confirm error:', data);
        setWaStatus('Failed to send WhatsApp. Please retry.');
      } else {
        setWaStatus('Address confirmation WhatsApp sent.');
      }
    } catch (e) {
      console.error(e);
      setWaStatus('Failed to send WhatsApp. Please retry.');
    } finally {
      setWaSending(false);
    }
  };

  const handleSendCodConfirmation = async () => {
    if (!lead?.phone) {
      setCodStatus('Phone number missing.');
      return;
    }

    setCodSending(true);
    setCodStatus(null);
    setCodLink(null);

    try {
      const codRes = await fetch('/api/razorpay/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: lead.phone,
          name: lead.full_name || 'Customer',
          leadId: lead.id,
          amount: 1,
        }),
      });

      const codJson = await codRes.json();
      if (!codRes.ok || !codJson.success) {
        console.error('Razorpay COD error:', codJson);
        setCodStatus('Failed to create COD confirmation link.');
        return;
      }

      const shortUrl: string = codJson.short_url;
      setCodLink(shortUrl);

      const text = `Namaste ${
        lead.full_name || 'ji'
      },\n\nNaturavya se bol raha/rahi hoon. Aapke COD order ko confirm karne ke liye sirf *₹1 ka secure confirmation* link bhej rahe hain:\n${shortUrl}\n\nIs link par click karke ₹1 pay kar dijiye. Baaki amount aap delivery par COD se denge.\n\nIsse fake / wrong orders filter hote hain aur aapka parcel safe tarike se deliver hota hai.\n\nDhanyavaad,\nTeam Naturavya`;

      const waRes = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: lead.phone, text }),
      });

      const waJson = await waRes.json();
      if (!waRes.ok || !waJson.success) {
        console.error('WA COD send error:', waJson);
        setCodStatus(
          'Link created, but WhatsApp sending failed. Copy and send manually.'
        );
      } else {
        setCodStatus('COD confirmation link sent on WhatsApp.');
      }
    } catch (e) {
      console.error(e);
      setCodStatus('Failed to send COD confirmation. Please retry.');
    } finally {
      setCodSending(false);
    }
  };

  // ---- CALL RECORDING / WHISPER HANDLERS ----

  const handleUploadCallRecording = async (file: File) => {
    if (!leadId || !file) return;
    setUploadingCall(true);
    setCallStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('direction', 'outbound');
      formData.append('call_type', 'phone');
      formData.append('status', 'completed');

      const res = await fetch(`/api/admin/leads/${leadId}/calls`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error('Call upload error:', data);
        setCallStatus('Upload failed. Please try again.');
        return;
      }

      setLastCall(data.call);
      setCallStatus('Call processed. AI summary ready below.');
    } catch (e) {
      console.error(e);
      setCallStatus('Upload failed. Please try again.');
    } finally {
      setUploadingCall(false);
    }
  };

  const handleCallFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleUploadCallRecording(file);
    e.target.value = '';
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );

  if (!lead)
    return (
      <div className="p-8 text-center text-red-500">
        <p>Lead not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600 underline font-bold"
        >
          Go Back
        </button>
      </div>
    );

  const isAddressMissing = !lead.address || !lead.pincode || !lead.city;
  const aiInsights: any[] = Array.isArray(lead.ai_insights)
    ? lead.ai_insights
    : [];

  const activities: any[] = Array.isArray(lead.activities)
    ? lead.activities
    : [];
  const statusHistory: any[] = Array.isArray(lead.status_history)
    ? lead.status_history
    : [];
  const orders: any[] = Array.isArray(lead.orders) ? lead.orders : [];
  const followups: any[] = Array.isArray(lead.followups)
    ? lead.followups
    : [];

  const pendingFollowups = followups
    .filter((f: any) => f.status === 'pending')
    .sort(
      (a: any, b: any) =>
        new Date(a.scheduled_at).getTime() -
        new Date(b.scheduled_at).getTime()
    );
  const nextFollowup = pendingFollowups[0] || null;
  const sentFollowups = followups
    .filter((f: any) => f.status === 'sent')
    .sort(
      (a: any, b: any) =>
        new Date(b.executed_at || b.scheduled_at).getTime() -
        new Date(a.executed_at || a.scheduled_at).getTime()
    )
    .slice(0, 3);
  const failedFollowups = followups
    .filter((f: any) => f.status === 'failed')
    .sort(
      (a: any, b: any) =>
        new Date(b.executed_at || b.scheduled_at).getTime() -
        new Date(a.executed_at || a.scheduled_at).getTime()
    )
    .slice(0, 1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* ALERT: MISSING ADDRESS */}
        {isAddressMissing && (
          <div className="mb-6 bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-red-50">
            <div className="flex items-center gap-4 text-red-700">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black uppercase tracking-tighter text-sm">
                  Meta Lead: Address Required
                </p>
                <p className="font-bold">
                  Shipping address is missing for this lead.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddressModal(true)}
              className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all active:scale-95"
            >
              Add Address Now
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-blue-100">
              {lead.full_name?.[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lead.full_name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(
                    lead.status
                  )}`}
                >
                  {lead.status}
                </span>
                <span className="text-gray-400 text-sm flex items-center font-medium">
                  <Clock className="w-4 h-4 mr-1" />
                  Started {format(new Date(lead.created_at), 'MMM d, p')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                router.push(
                  `/admin/orders/manual?name=${lead.full_name}&phone=${lead.phone}&leadId=${lead.id}`
                )
              }
              className="px-6 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 shadow-lg shadow-orange-100 flex items-center gap-2 font-bold transition-all active:scale-95"
            >
              <Package size={18} /> Create Order
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 flex items-center gap-2 font-bold shadow-sm transition-all"
            >
              <Edit size={18} /> Edit Details
            </button>
          </div>
        </div>

        {/* Quick Action Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() =>
              handleQuickUpdate({ priority: lead.priority === 2 ? 0 : 2 })
            }
            className={`p-6 rounded-[2rem] flex items-center justify-between border-2 transition-all ${
              lead.priority === 2
                ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-200'
                : 'bg-white border-red-50 text-red-600 hover:bg-red-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl ${
                  lead.priority === 2 ? 'bg-red-500' : 'bg-red-50'
                }`}
              >
                <Sparkles
                  className={lead.priority === 2 ? 'text-white' : 'text-red-500'}
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase opacity-60">
                  Priority
                </p>
                <p className="text-xl font-bold">Hot Lead</p>
              </div>
            </div>
            {lead.priority === 2 && <CheckCircle size={24} />}
          </button>

          <button
            onClick={() =>
              handleQuickUpdate({
                status:
                  lead.status === 'follow_up' ? 'contacted' : 'follow_up',
              })
            }
            className={`p-6 rounded-[2rem] flex items-center justify-between border-2 transition-all ${
              lead.status === 'follow_up'
                ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-200'
                : 'bg-white border-amber-50 text-amber-600 hover:bg-amber-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl ${
                  lead.status === 'follow_up' ? 'bg-amber-400' : 'bg-amber-50'
                }`}
              >
                <Clock
                  className={
                    lead.status === 'follow_up'
                      ? 'text-white'
                      : 'text-amber-500'
                  }
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase opacity-60">
                  Workflow
                </p>
                <p className="text-xl font-bold">Follow-up</p>
              </div>
            </div>
            {lead.status === 'follow_up' && <CheckCircle size={24} />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: shipping + notes + activity timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <MapPin className="text-blue-500" /> Shipping Information
                </h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1"
                >
                  <Edit size={14} /> Edit Address
                </button>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                  {lead.address || (
                    <span className="text-red-400 italic">
                      Address not provided
                    </span>
                  )}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                  <div className="text-sm">
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                      City
                    </p>
                    <p className="font-bold text-gray-700">
                      {lead.city || '-'}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                      State
                    </p>
                    <p className="font-bold text-gray-700">
                      {lead.state || '-'}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                      Pincode
                    </p>
                    <p className="font-bold text-gray-700">
                      {lead.pincode || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Quote size={20} className="text-blue-400" /> Internal Remarks
              </h2>
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-gray-700 min-h-[100px] whitespace-pre-wrap leading-relaxed">
                {lead.notes || 'No notes added yet for this client.'}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Activity Timeline
              </h2>
              {activities.length === 0 && statusHistory.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No calls or status changes logged yet for this lead.
                </p>
              ) : (
                <div className="space-y-4 text-sm">
                  {activities.slice(0, 5).map((a: any) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 border-l-2 border-blue-100 pl-3"
                    >
                      <div className="mt-1 w-2 h-2 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-gray-900">
                            {a.activity_type || 'Activity'}
                          </span>
                          {a.created_at && (
                            <span className="text-[11px] text-gray-400">
                              {format(
                                new Date(a.created_at),
                                'MMM d, HH:mm'
                              )}
                            </span>
                          )}
                        </div>
                        {a.description && (
                          <p className="text-gray-700">{a.description}</p>
                        )}
                        {a.outcome && (
                          <p className="text-xs text-gray-500">
                            Outcome: {a.outcome}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {statusHistory.slice(0, 5).map((s: any) => (
                    <div
                      key={s.id}
                      className="flex items-start gap-3 border-l-2 border-gray-100 pl-3"
                    >
                      <div className="mt-1 w-2 h-2 rounded-full bg-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-gray-900">
                            Status: {s.old_status} → {s.new_status}
                          </span>
                          {s.created_at && (
                            <span className="text-[11px] text-gray-400">
                              {format(
                                new Date(s.created_at),
                                'MMM d, HH:mm'
                              )}
                            </span>
                          )}
                        </div>
                        {s.notes && (
                          <p className="text-xs text-gray-600">{s.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RTO + followups + call summary + AI + orders + meta */}
          <div className="space-y-8">
            {/* RTO Control Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-emerald-100 p-8">
              <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                RTO Control
              </h2>

              <div className="space-y-3 mb-4">
                <p className="text-xs text-gray-500">
                  Use WhatsApp + ₹1 Razorpay confirmation to cut fake / wrong
                  COD orders.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span
                    className={`px-2 py-1 rounded-full border ${
                      isAddressMissing
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {isAddressMissing
                      ? 'Address incomplete – high RTO risk'
                      : 'Address filled – good'}
                  </span>
                  {lead.phone ? (
                    <span className="px-2 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                      Phone OK
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full border border-red-200 bg-red-50 text-red-700">
                      Phone missing
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSendAddressConfirmWhatsApp}
                  disabled={waSending || !lead.phone}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {waSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending address confirm WhatsApp...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp: Confirm Address
                    </>
                  )}
                </button>
                {waStatus && (
                  <p className="text-xs text-gray-600">{waStatus}</p>
                )}

                <button
                  type="button"
                  onClick={handleSendCodConfirmation}
                  disabled={codSending || !lead.phone}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {codSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating & sending COD link...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      WhatsApp: ₹1 COD Confirmation Link
                    </>
                  )}
                </button>
                {codStatus && (
                  <p className="text-xs text-gray-600">{codStatus}</p>
                )}
                {codLink && (
                  <div className="mt-1 text-xs text-gray-600">
                    Link:{' '}
                    <a
                      href={codLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 underline break-all"
                    >
                      {codLink}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Auto WhatsApp Follow-ups */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-green-100 p-8">
              <h2 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                Auto WhatsApp Follow-ups
              </h2>
              {followups.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Is lead ke liye koi scheduled auto follow-ups nahi bane hue
                  hain. Status change (Not Picked / Follow Up / Callback) se
                  sequences auto trigger honge.
                </p>
              ) : (
                <div className="space-y-3 text-xs text-gray-800">
                  {nextFollowup ? (
                    <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-green-800">
                          Next message (pending)
                        </span>
                        <span className="text-[11px] text-green-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(
                            new Date(nextFollowup.scheduled_at),
                            'MMM d, HH:mm'
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600">
                        Channel: {nextFollowup.channel || 'whatsapp'} •
                        Attempts: {nextFollowup.attempts}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                      <span className="text-[11px] text-gray-600">
                        Koi pending auto follow-up nahi hai. Saare scheduled
                        messages send / fail ho chuke hain.
                      </span>
                    </div>
                  )}

                  {sentFollowups.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Recent sent
                      </p>
                      <div className="space-y-1">
                        {sentFollowups.map((f: any) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <span className="truncate max-w-[140px]">
                              {f.channel || 'whatsapp'} • attempts{' '}
                              {f.attempts}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {format(
                                new Date(
                                  f.executed_at || f.scheduled_at
                                ),
                                'MMM d, HH:mm'
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {failedFollowups.length > 0 && (
                    <div>
                      <p className="font-semibold text-red-700 mb-1">
                        Last failure
                      </p>
                      {failedFollowups.map((f: any) => (
                        <div
                          key={f.id}
                          className="p-2 bg-red-50 border border-red-100 rounded-lg text-[11px] text-red-700"
                        >
                          <div className="flex items-center justify-between">
                            <span>
                              {f.channel || 'whatsapp'} • attempts{' '}
                              {f.attempts}
                            </span>
                            <span className="text-[10px]">
                              {format(
                                new Date(
                                  f.executed_at || f.scheduled_at
                                ),
                                'MMM d, HH:mm'
                              )}
                            </span>
                          </div>
                          {f.last_error && (
                            <p className="mt-1 truncate">
                              Error: {f.last_error}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Call Recording + AI Summary */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-blue-100 p-8">
              <h2 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500" />
                Call Recording & AI Summary
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Upload call recording (audio). We&apos;ll auto-transcribe with
                Whisper and summarize the call for you.
              </p>

              <div className="space-y-3">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleCallFileChange}
                  disabled={uploadingCall}
                  className="block w-full text-xs text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
                {uploadingCall && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing call with Whisper & AI...
                  </div>
                )}
                {callStatus && (
                  <p className="text-xs text-gray-700">{callStatus}</p>
                )}

                {lastCall && (
                  <div className="mt-3 space-y-2 text-xs text-gray-800 bg-gray-50 border border-gray-100 rounded-2xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        Last call:{' '}
                        {lastCall.started_at
                          ? format(
                              new Date(lastCall.started_at),
                              'MMM d, p'
                            )
                          : 'N/A'}
                      </span>
                      {lastCall.duration_seconds != null && (
                        <span className="text-[11px] text-gray-500">
                          {Math.round(lastCall.duration_seconds)} sec
                        </span>
                      )}
                    </div>
                    {lastCall.ai_summary && (
                      <div>
                        <span className="font-semibold">Summary: </span>
                        <span>{lastCall.ai_summary}</span>
                      </div>
                    )}
                    {lastCall.ai_next_action && (
                      <div>
                        <span className="font-semibold">
                          Next action:{' '}
                        </span>
                        <span>{lastCall.ai_next_action}</span>
                      </div>
                    )}
                    {lastCall.recording_url && (
                      <div>
                        <a
                          href={lastCall.recording_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          Open recording
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AI Assistant Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-purple-100 p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                    <Bot className="text-purple-500 w-5 h-5" />
                    AI Call Script
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Naturavya-style pitch, objections & closing lines for this
                    lead.
                  </p>
                </div>
                <button
                  onClick={handleGenerateAi}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      {lead.ai_suggested_message ? 'Regenerate' : 'Generate'}
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <p className="text-xs text-red-500 mb-3">{aiError}</p>
              )}

              <div className="space-y-4">
                {/* Script block */}
                <div className="relative">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Call Script
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm text-gray-800 whitespace-pre-wrap min-h-[80px]">
                    {lead.ai_suggested_message
                      ? lead.ai_suggested_message
                      : aiLoading
                      ? 'AI is preparing the script...'
                      : 'No script yet. Click “Generate” to create a tailored call script for this lead.'}
                  </div>
                  {lead.ai_suggested_message && (
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="absolute right-3 top-0 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border text-xs text-gray-600 hover:bg-gray-50"
                    >
                      {copiedScript ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Suggested next action */}
                {lead.ai_suggested_action && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Suggested Next Action
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-xs text-emerald-900">
                      {lead.ai_suggested_action}
                    </div>
                  </div>
                )}

                {/* Bullet insights */}
                {aiInsights && aiInsights.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      AI Insights
                    </div>
                    <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                      {aiInsights.map((item, idx) => {
                        const text =
                          typeof item === 'string'
                            ? item
                            : item?.text ||
                              item?.summary ||
                              JSON.stringify(item);
                        return <li key={idx}>{text}</li>;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold mb-4 text-gray-900">
                Order History (by phone)
              </h2>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No orders found for this phone yet.
                </p>
              ) : (
                <div className="space-y-3 text-sm">
                  {orders.slice(0, 5).map((o: any) => (
                    <OrderCard key={o.id} order={o} lead={lead} />
                  ))}
                </div>
              )}
            </div>

            {/* Meta Sidebar */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold mb-6 text-gray-800">
                Lead Context
              </h2>
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
                    Source channel
                  </p>
                  <p className="font-bold text-gray-900 capitalize">
                    {lead.source}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">
                    Campaign
                  </p>
                  <p className="font-bold text-gray-900">
                    {lead.campaign_name || lead.source_campaign || 'None'}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">
                    Assigned Agent
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                      {lead.assigned_team_member?.name?.[0] || 'A'}
                    </div>
                    <p className="text-sm font-bold text-gray-700">
                      {lead.assigned_team_member?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {showAddressModal && (
        <AddressUpdateModal
          lead={lead}
          onClose={() => setShowAddressModal(false)}
          onSuccess={() => {
            setShowAddressModal(false);
            fetchLead();
          }}
        />
      )}

      {showEditModal && (
        <EditLeadModal
          lead={lead}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchLead();
          }}
        />
      )}
    </div>
  );
}

// --- OrderCard and OrderStatusModal components ---

function OrderCard({ order, lead }: { order: any; lead: any }) {
  const [showStatusModal, setShowStatusModal] = useState(false);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
      <div>
        <p className="font-semibold text-gray-900">
          {order.order_number || order.id}
        </p>
        <p className="text-xs text-gray-500">
          {order.created_at
            ? format(new Date(order.created_at), 'MMM d, p')
            : ''}
        </p>
        <p className="text-xs text-gray-600 capitalize">
          Status: {order.current_status || order.status || 'unknown'}
          {order.is_rto && (
            <span className="ml-2 text-red-600 font-semibold">
              RTO
            </span>
          )}
        </p>
        {order.awb_number && (
          <p className="text-[11px] text-gray-500">
            AWB: {order.awb_number}
          </p>
        )}
        {order.tracking_link && (
          <a
            href={order.tracking_link}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline text-xs"
          >
            Track Order
          </a>
        )}
      </div>
      <div className="text-right flex flex-col gap-2">
        <p className="font-semibold text-gray-900">
          ₹ {(order.total || order.total_amount || 0).toFixed?.(0) ??
            order.total ??
            order.total_amount ??
            0}
        </p>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
          onClick={() => setShowStatusModal(true)}
        >
          Update Status
        </button>
      </div>
      {showStatusModal && (
        <OrderStatusModal
          order={order}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
}

function OrderStatusModal({ order, onClose }: { order: any; onClose: () => void }) {
  const [status, setStatus] = useState(order.current_status || order.status || 'confirmed');
  const [awb, setAwb] = useState(order.awb_number || '');
  const [tracking, setTracking] = useState(order.tracking_link || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          awb_number: awb,
          tracking_link: tracking,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      onClose();
      window.location.reload();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold mb-4">Update Order Status</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1">Status</label>
            <select
              className="w-full border rounded-lg p-2"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="rto">RTO</option>
            </select>
          </div>
          {(status === 'shipped' || status === 'delivered') && (
            <>
              <div>
                <label className="block text-xs font-bold mb-1">AWB Number</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={awb}
                  onChange={e => setAwb(e.target.value)}
                  placeholder="Enter AWB / Tracking Number"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Tracking Link</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={tracking}
                  onChange={e => setTracking(e.target.value)}
                  placeholder="Paste tracking link (optional)"
                />
              </div>
            </>
          )}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button
              className="flex-1 py-2 bg-gray-100 rounded-lg text-gray-700 font-bold"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'contacted':
      return 'bg-sky-100 text-sky-700 border border-sky-200';
    case 'follow_up':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'qualified':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'converted':
    case 'interested':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'lost':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200';
  }
}

function AddressUpdateModal({ lead, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [formData, setFormData] = useState({
    address: lead.address || '',
    city: lead.city || '',
    state: lead.state || '',
    pincode: lead.pincode || '',
  });

  useEffect(() => {
    if (formData.pincode.length === 6) {
      const lookup = async () => {
        setFetchingPincode(true);
        try {
          const res = await fetch(
            `https://api.postalpincode.in/pincode/${formData.pincode}`
          );
          const data = await res.json();
          if (data[0].Status === 'Success') {
            const po = data[0].PostOffice[0];
            setFormData((prev) => ({
              ...prev,
              city: po.District,
              state: po.State,
            }));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setFetchingPincode(false);
        }
      };
      lookup();
    }
  }, [formData.pincode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) onSuccess();
    } catch (err) {
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home size={24} /> Address Detail
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <textarea
            required
            rows={3}
            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-semibold transition-all"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Street, building, house no..."
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 relative">
              <input
                required
                maxLength={6}
                className="w-full p-4 bg-blue-50/30 border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-blue-900"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pincode: e.target.value.replace(/\D/g, ''),
                  })
                }
                placeholder="6-digit PIN"
              />
              {fetchingPincode && (
                <Loader2
                  className="absolute right-4 top-4 animate-spin text-blue-600"
                  size={20}
                />
              )}
            </div>
            <input
              className="w-full p-4 bg-gray-100 border-none rounded-2xl font-bold text-gray-600"
              value={formData.city}
              readOnly
              placeholder="City"
            />
            <input
              className="w-full p-4 bg-gray-100 border-none rounded-2xl font-bold text-gray-600"
              value={formData.state}
              readOnly
              placeholder="State"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 font-bold text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save />}{' '}
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditLeadModal({ lead, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: lead.full_name,
    phone: lead.phone,
    email: lead.email || '',
    status: lead.status,
    assigned_to: lead.assigned_to || '',
    priority: lead.priority || 0,
    notes: lead.notes || '',
  });

  useEffect(() => {
    fetch('/api/admin/team')
      .then((res) => res.json())
      .then((data) =>
        setAgents(
          data.teamMembers?.filter((m: any) => m.is_active) || []
        )
      );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-bold">Edit Lead Info</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              className="w-full p-4 border rounded-2xl bg-gray-50"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
            />
            <input
              required
              className="w-full p-4 border rounded-2xl bg-gray-50"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <select
              className="w-full p-4 border rounded-2xl bg-gray-50 col-span-2"
              value={formData.assigned_to}
              onChange={(e) =>
                setFormData({ ...formData, assigned_to: e.target.value })
              }
            >
              <option value="">Select Agent (Unassigned)</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <select
              className="w-full p-4 border rounded-2xl bg-gray-50"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="follow_up">Follow Up</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
            <select
              className="w-full p-4 border rounded-2xl bg-gray-50"
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: parseInt(e.target.value, 10),
                })
              }
            >
              <option value="0">Low</option>
              <option value="1">Medium</option>
              <option value="2">High / Hot</option>
            </select>
          </div>
          <textarea
            rows={4}
            className="w-full p-4 border rounded-2xl bg-gray-50"
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border rounded-2xl text-gray-500 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save />
              )}{' '}
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}