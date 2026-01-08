import { prisma } from "@/lib/prisma";

type SystemConfig = {
  cloudinary?: { cloudName: string; apiKey: string; apiSecret: string };
  resend?: { apiKey: string; fromEmail: string };
  pusher?: { appId: string; key: string; secret: string; cluster: string };
  social?: {
    googleClientId?: string;
    googleClientSecret?: string;
    facebookClientId?: string;
    facebookClientSecret?: string;
    appleId?: string;
    appleSecret?: string;
  };
};

export async function getSystemConfig() {
  // 1. Try fetching from DB
  const setting = await prisma.setting.findUnique({
    where: { id: "system.config" },
  });

  const dbConfig = (setting?.jsonContent as SystemConfig) || {};

  // 2. Merge with Env vars (DB takes precedence if exists, otherwise Env)
  return {
    cloudinary: {
      cloudName:
        dbConfig?.cloudinary?.cloudName ||
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey:
        dbConfig?.cloudinary?.apiKey ||
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      apiSecret:
        dbConfig?.cloudinary?.apiSecret || process.env.CLOUDINARY_API_SECRET,
    },
    resend: {
      apiKey: dbConfig?.resend?.apiKey || process.env.RESEND_API_KEY,
      fromEmail: dbConfig?.resend?.fromEmail || process.env.EMAIL_FROM,
    },
    pusher: {
      appId: dbConfig?.pusher?.appId || process.env.PUSHER_APP_ID,
      key: dbConfig?.pusher?.key || process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: dbConfig?.pusher?.secret || process.env.PUSHER_SECRET,
      cluster: dbConfig?.pusher?.cluster || process.env.PUSHER_CLUSTER,
    },
    social: {
      googleClientId:
        dbConfig.social?.googleClientId || process.env.GOOGLE_CLIENT_ID,
      googleClientSecret:
        dbConfig.social?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET,
      facebookClientId:
        dbConfig.social?.facebookClientId || process.env.FACEBOOK_CLIENT_ID,
      facebookClientSecret:
        dbConfig.social?.facebookClientSecret ||
        process.env.FACEBOOK_CLIENT_SECRET,
      appleId: dbConfig.social?.appleId || process.env.APPLE_ID,
      appleSecret:
        dbConfig.social?.appleSecret || process.env.APPLE_CLIENT_SECRET,
    },
  };
}
