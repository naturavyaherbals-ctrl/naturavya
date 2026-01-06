import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, customerName, customerEmail, totalAmount, items } = body;

    // 1. Create the HTML email content
    // (You can make this fancier later with React Email)
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #15803d;">Thank you for your order!</h1>
        <p>Hi ${customerName},</p>
        <p>We have received your order <strong>#${orderId}</strong> and it is being processed.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Summary</h3>
          <ul style="padding-left: 20px;">
            ${items.map((item: any) => `
              <li style="margin-bottom: 10px;">
                ${item.name} x ${item.quantity || 1} - ₹${item.price}
              </li>
            `).join('')}
          </ul>
          <hr style="border: 1px solid #e5e7eb; margin: 15px 0;">
          <p style="font-size: 18px; font-weight: bold; margin: 0;">Total: ₹${totalAmount}</p>
        </div>

        <p>We will notify you once your items are shipped!</p>
        <p>Best regards,<br>The Naturavya Team</p>
      </div>
    `;

    // 2. Send the email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Naturavya Orders <onboarding@resend.dev>', // Use this for testing. Later verify your domain.
      to: [customerEmail], // The customer's email
      subject: `Order Confirmation #${orderId}`,
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully', data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}