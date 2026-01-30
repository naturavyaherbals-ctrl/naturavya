type SendWhatsAppParams = {
  to: string;
  message: string;
};

export async function sendWhatsAppText({
  to,
  message,
}: SendWhatsAppParams) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error("WhatsApp env vars missing");
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: message,
        },
      }),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    console.error("WhatsApp send failed:", json);
    throw new Error("WhatsApp send failed");
  }

  return json;
}
