import { NextResponse } from "next/server";
import { Resend } from "resend";
import * as z from "zod";

// 1. Define strict validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email format"),
  subject: z.string().min(4, "Subject too short"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  // Honeypot field (should be empty, used to catch bots)
  botField: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  // 2. Build-safe check for API Keys
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey || !adminEmail) {
    console.error(
      "❌ [CONTACT_API]: Environment variables RESEND_API_KEY or ADMIN_EMAIL are missing."
    );
    return NextResponse.json(
      { message: "Server configuration error. Please try again later." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const validation = contactFormSchema.safeParse(body);

    // 3. Validation Error Handling
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    // 4. Initialize Resend inside the handler (Build-Safe)
    const resend = new Resend(apiKey);

    // 5. Send Professional HTML Email
    const { error } = await resend.emails.send({
      from: "SARAGEA Contact <noreply@saragea.com>", // Ensure this domain is verified in Resend
      to: [adminEmail],
      subject: `[Website Contact] ${subject}`,
      replyTo: email,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #333; border-bottom: 2px solid #5D5FEF; padding-bottom: 10px;">New Inquiry from SARAGEA</h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #5D5FEF;">
            <p style="margin: 0; color: #555; white-space: pre-wrap;">${message}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            This email was generated from the contact form at saragea.co.tz.<br/>
            Timestamp: ${new Date().toLocaleString("en-TZ", { timeZone: "Africa/Dar_es_Salaam" })}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ [RESEND_ERROR]:", error);
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully!",
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("❌ [CONTACT_API_EXCEPTION]:", errorMessage);

    return NextResponse.json(
      { message: "Could not send message. Please try again later." },
      { status: 500 }
    );
  }
}
