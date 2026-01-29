import { NextResponse } from "next/server";
import { sendMetaCRMEvent } from "@/lib/meta-capi";

export async function GET() {
  const res = await sendMetaCRMEvent({
    eventName: "Lead",
    leadId: "TEST_LEAD_001",
    phone: "9999999999",
    email: "test@naturavya.com",
  });

  return NextResponse.json(res);
}
