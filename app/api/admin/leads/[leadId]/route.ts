import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET Single Lead (Already created, keeping for context)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;
  const adminClient = createAdminClient();
  const { data: lead, error } = await adminClient
    .from('leads')
    .select('*, assigned_team_member:team_members(id, name, email)')
    .eq('id', leadId)
    .single();

  if (error) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json({ success: true, lead });
}

// 👇 NEW: PATCH Method to update lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const body = await request.json();
    const adminClient = createAdminClient();

    const { data: updatedLead, error } = await adminClient
      .from('leads')
      .update({
        full_name: body.full_name,
        phone: body.phone,
        email: body.email,
        status: body.status,
        assigned_to: body.assigned_to, // The Agent ID
        address: body.address,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        notes: body.notes,
        priority: parseInt(body.priority || 0),
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}