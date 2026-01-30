import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWhatsAppSuggestion } from "@/lib/ai/whatsapp-suggestions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { lead_id } = await req.json();

    if (!lead_id) {
      return NextResponse.json(
        { error: "lead_id is required" },
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

    const message = getWhatsAppSuggestion(lead);

    await supabase
      .from("leads")
      .update({
        ai_suggested_message: message,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", lead_id);

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (err: any) {
    console.error("AI suggest message error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
