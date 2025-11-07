// lib/auth-emails.ts
import { Resend } from "resend";
import type { SendVerificationRequestParams } from "next-auth/providers/email";

const resend = new Resend(process.env.RESEND_API_KEY!);

// ✅ Hii ndiyo signature sahihi
export async function sendVerificationRequest({
  identifier,
  url,
  provider,
}: SendVerificationRequestParams): Promise<void> {
  const { host } = new URL(url);

  const htmlContent = `
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <h1 style="font-size: 24px; color: #0056b3; text-align: center;">Sign in to SARAGEA Appartments</h1>
        <p style="text-align: center;">Welcome! Click the button below to sign in securely to your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" target="_blank" style="background-color: #007bff; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Sign In</a>
        </div>
        <p style="text-align: center; font-size: 12px; color: #777;">If you did not request this email, you can safely ignore it.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="text-align: center; font-size: 10px; color: #aaa;">&copy; ${new Date().getFullYear()} SARAGEA Appartments. All rights reserved.</p>
      </div>
    </body>
  `;

  try {
    await resend.emails.send({
      from: provider.from, // ✅ NextAuth inakupa hii tayari
      to: [identifier],    // ✅ "identifier" ndiyo email
      subject: `Sign in to ${host}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error(
      "Could not send verification email. Please try again later."
    );
  }
}
