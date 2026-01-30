export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppText } from "@/lib/whatsapp/send";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const agentId = req.headers.get("x-agent-id");
    if (!agentId) {
      return NextResponse.json(
        { error: "Unauthorized agent" },
        { status: 401 }
      );
    }

    const { lead_id, message } = await req.json();
    if (!lead_id || !message) {
      return NextResponse.json(
        { error: "lead_id and message required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (error || !lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    await sendWhatsAppText({
      to: lead.phone,
      message,
    });

    await supabase
      .from("leads")
      .update({
        whatsapp_responses: (lead.whatsapp_responses || 0) + 1,
        last_contacted_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        follow_up_count: (lead.follow_up_count || 0) + 1,
      })
      .eq("id", lead_id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WhatsApp send error:", err);
    return NextResponse.json(
      { error: "Failed to send WhatsApp" },
      { status: 500 }
    );
  }
}
