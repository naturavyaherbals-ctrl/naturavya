import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const agentId = req.headers.get("x-agent-id");

    if (!agentId) {
      return NextResponse.json(
        { error: "Unauthorized agent" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("assigned_to", agentId)
      .eq("is_converted", false)
      .or("next_follow_up_at.lte.now(),last_contacted_at.is.null")
      .order("priority", { ascending: false })
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(30);

    if (error) {
      console.error("Agent tasks error:", error);
      return NextResponse.json(
        { error: "Failed to load tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    console.error("Agent task crash:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
