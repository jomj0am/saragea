import { prisma } from "@/lib/prisma";
import { getPusherServer } from "@/lib/pusher";
import { Resend } from "resend";
import { NotificationType } from "@prisma/client";

// Lazy load Resend
const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
};

interface NotifyParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  sendEmail?: boolean; // Option to skip email for minor things
}

export async function sendNotification({
  userId,
  title,
  message,
  type = "INFO",
  link,
  sendEmail = true,
}: NotifyParams) {
  try {
    // 1. Get User Data (for email)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    // 2. Save to Database
    const notification = await prisma.notification.create({
      data: { userId, title, message, type, link },
    });

    // 3. Trigger Real-time UI (Pusher)
    const pusher = getPusherServer();
    if (pusher) {
      // Channel: user-{userId}
      await pusher.trigger(`user-${userId}`, "notification:new", notification);
    }

    // 4. Send Email (if enabled)
    if (sendEmail && user.email) {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from:
            process.env.EMAIL_FROM ||
            "SARAGEA Notifications <noreply@saragea.com>",
          to: user.email,
          subject: `🔔 ${title}`,
          html: `
                        <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f5;">
                            <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <h2 style="color: #4F46E5; margin-top: 0;">${title}</h2>
                                <p style="font-size: 16px; color: #374151; line-height: 1.5;">${message}</p>
                                ${
                                  link
                                    ? `
                                    <div style="margin-top: 25px;">
                                        <a href="${process.env.NEXTAUTH_URL}${link}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                            View Details
                                        </a>
                                    </div>
                                `
                                    : ""
                                }
                                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                                <p style="font-size: 12px; color: #9ca3af;">SARAGEA Real Estate Management</p>
                            </div>
                        </div>
                    `,
        });
      }
    }

    return notification;
  } catch (error) {
    console.error("Notification Error:", error);
  }
}
