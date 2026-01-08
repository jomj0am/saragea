// lib/auth-emails.ts
import { Resend } from "resend";
import type { SendVerificationRequestParams } from "next-auth/providers/email";

/**
 * Sends a premium, branded Magic Link email via Resend.
 * Lazy initialization of Resend client prevents Docker build crashes.
 */
export async function sendVerificationRequest({
  identifier,
  url,
  provider,
}: SendVerificationRequestParams): Promise<void> {
  const { host } = new URL(url);

  // 1. Build-safe check for API Key
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "❌ [AUTH_EMAIL]: RESEND_API_KEY is missing in environment variables."
    );
    return;
  }

  // 2. Initialize client inside the function
  const resend = new Resend(apiKey);

  // 3. Modern, branded HTML Template
  const htmlContent = `
    <div style="background-color: #f6f9fc; padding: 50px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <!-- Header / Logo Area -->
        <tr>
          <td style="padding: 40px 40px 20px 40px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #5D5FEF; letter-spacing: -1px;">SARAGEA</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Modern Apartments</p>
          </td>
        </tr>

        <!-- Content Area -->
        <tr>
          <td style="padding: 20px 40px 40px 40px;">
            <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #333; text-align: center;">Sign in to your account</h2>
            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #555; text-align: center;">
              Welcome back! To access your SARAGEA dashboard, please click the secure button below.
            </p>

            <!-- CTA Button -->
            <table align="center" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="border-radius: 12px;" bgcolor="#5D5FEF">
                  <a href="${url}" target="_blank" style="padding: 18px 36px; font-size: 16px; font-weight: 700; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; display: inline-block;">
                    Sign In to SARAGEA
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin: 35px 0 0 0; font-size: 13px; line-height: 20px; color: #888; text-align: center;">
              This link was requested for <strong style="color: #333;">${identifier}</strong> and will expire soon for security. 
              If you didn't request this email, you can safely ignore it.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #aaa;">
              &copy; ${new Date().getFullYear()} SARAGEA Apartments. All rights reserved.<br/>
              Dar es Salaam, Tanzania
            </p>
          </td>
        </tr>
      </table>
      
      <!-- Hidden identifier for email clients -->
      <p style="opacity: 0; font-size: 1px; color: transparent; line-height: 1px;">Host: ${host}</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: provider.from || "SARAGEA <noreply@saragea.com>",
      to: [identifier],
      subject: `Secure Login to SARAGEA`,
      html: htmlContent,
      // Optional: Text version for old clients
      text: `Sign in to SARAGEA: ${url}`,
    });

    if (error) {
      console.error("❌ [RESEND_ERROR]:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error(
      "❌ [AUTH_EMAIL_EXCEPTION]: Failed to send verification email:",
      error
    );
    throw new Error(
      "Could not send verification email. Please try again later."
    );
  }
}
