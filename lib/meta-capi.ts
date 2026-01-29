import crypto from "crypto";

const sha256 = (v: string) =>
  crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export async function sendMetaCRMEvent({
  eventName,
  leadId,
  phone,
  email,
}: {
  eventName: "Lead" | "QualifiedLead" | "Purchase";
  leadId: string;
  phone?: string;
  email?: string;
}) {
  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "system_generated",
        custom_data: {
          event_source: "crm",
          lead_event_source: "Naturavya CRM",
        },
        user_data: {
          lead_id: leadId,
          ph: phone ? [sha256(phone)] : undefined,
          em: email ? [sha256(email)] : undefined,
        },
      },
    ],
  };

  const res = await fetch(
    `https://graph.facebook.com/v24.0/${process.env.META_DATASET_ID}/events?access_token=${process.env.META_CAPI_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    console.error("❌ Meta CAPI Error:", json);
  }

  return json;
}
