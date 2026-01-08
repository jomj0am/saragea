// src/app/[locale]/(admin)/admin/settings/SettingsPageServer.tsx
import { prisma } from "@/lib/prisma";
import SettingsTabsClient from "./SettingsTabsClient"; // Hakikisha path ni sahihi
import { type Translation } from "@prisma/client";

// 'Type' kwa ajili ya tafsiri zilizopangwa
interface SystemConfig {
  cloudinary?: {
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string;
  };
  resend?: {
    apiKey?: string;
    fromEmail?: string;
  };
  pusher?: {
    appId?: string;
    key?: string;
    secret?: string;
    cluster?: string;
  };
  social?: {
    googleClientId?: string;
    googleClientSecret?: string;
    facebookClientId?: string;
    facebookClientSecret?: string;
    appleId?: string;
    appleSecret?: string;
  };
}
// Helper to check string existence safely
const hasVal = (val: string | undefined | null) => val && val.length > 0;

async function getSettingsData() {
  // 1. Fetch DB Data
  const [
    gateways,
    homepageSettings,
    contactSettings,
    allDbTranslations,
    systemConfigDb,
  ] = await Promise.all([
    prisma.paymentGateway.findMany({ orderBy: { name: "asc" } }),
    prisma.setting.findUnique({ where: { id: "page.home" } }),
    prisma.setting.findUnique({ where: { id: "page.contact" } }),
    prisma.translation.findMany({ orderBy: [{ key: "asc" }] }),
    prisma.setting.findUnique({ where: { id: "system.config" } }),
  ]);

  // 2. Parse DB Config
  const dbConfig =
    (systemConfigDb?.jsonContent as unknown as SystemConfig) || {};

  // 3. Construct Safe Config State (Merging Env + DB)
  // We strictly return booleans or public keys, never full secrets from Env
  const safeConfig = {
    cloudinary: {
      cloudName:
        dbConfig.cloudinary?.cloudName ||
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        "",
      apiKey:
        dbConfig.cloudinary?.apiKey ||
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
        "",
      // FIX: Wrap in Boolean() to ensure strict boolean type
      hasSecret: Boolean(
        hasVal(dbConfig.cloudinary?.apiSecret) ||
          hasVal(process.env.CLOUDINARY_API_SECRET)
      ),
      isConfigured: Boolean(
        (hasVal(dbConfig.cloudinary?.cloudName) ||
          hasVal(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)) &&
          (hasVal(dbConfig.cloudinary?.apiKey) ||
            hasVal(process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY)) &&
          (hasVal(dbConfig.cloudinary?.apiSecret) ||
            hasVal(process.env.CLOUDINARY_API_SECRET))
      ),
    },
    resend: {
      fromEmail: dbConfig.resend?.fromEmail || process.env.EMAIL_FROM || "",
      // FIX: Wrap in Boolean()
      hasApiKey: Boolean(
        hasVal(dbConfig.resend?.apiKey) || hasVal(process.env.RESEND_API_KEY)
      ),
      isConfigured: Boolean(
        hasVal(dbConfig.resend?.apiKey) || hasVal(process.env.RESEND_API_KEY)
      ),
    },
    pusher: {
      appId: dbConfig.pusher?.appId || process.env.PUSHER_APP_ID || "",
      key: dbConfig.pusher?.key || process.env.NEXT_PUBLIC_PUSHER_KEY || "",
      cluster: dbConfig.pusher?.cluster || process.env.PUSHER_CLUSTER || "ap2",
      // FIX: Wrap in Boolean()
      hasSecret: Boolean(
        hasVal(dbConfig.pusher?.secret) || hasVal(process.env.PUSHER_SECRET)
      ),
      isConfigured: Boolean(
        (hasVal(dbConfig.pusher?.appId) || hasVal(process.env.PUSHER_APP_ID)) &&
          (hasVal(dbConfig.pusher?.key) ||
            hasVal(process.env.NEXT_PUBLIC_PUSHER_KEY))
      ),
    },
    social: {
      google: {
        // FIX: Wrap in Boolean()
        isConfigured: Boolean(
          (hasVal(dbConfig.social?.googleClientId) ||
            hasVal(process.env.GOOGLE_CLIENT_ID)) &&
            (hasVal(dbConfig.social?.googleClientSecret) ||
              hasVal(process.env.GOOGLE_CLIENT_SECRET))
        ),
        clientId:
          dbConfig.social?.googleClientId || process.env.GOOGLE_CLIENT_ID || "",
        hasSecret: Boolean(
          hasVal(dbConfig.social?.googleClientSecret) ||
            hasVal(process.env.GOOGLE_CLIENT_SECRET)
        ),
      },
      facebook: {
        isConfigured: Boolean(
          (hasVal(dbConfig.social?.facebookClientId) ||
            hasVal(process.env.FACEBOOK_CLIENT_ID)) &&
            (hasVal(dbConfig.social?.facebookClientSecret) ||
              hasVal(process.env.FACEBOOK_CLIENT_SECRET))
        ),
        clientId:
          dbConfig.social?.facebookClientId ||
          process.env.FACEBOOK_CLIENT_ID ||
          "",
        hasSecret: Boolean(
          hasVal(dbConfig.social?.facebookClientSecret) ||
            hasVal(process.env.FACEBOOK_CLIENT_SECRET)
        ),
      },
      apple: {
        isConfigured: Boolean(
          (hasVal(dbConfig.social?.appleId) || hasVal(process.env.APPLE_ID)) &&
            (hasVal(dbConfig.social?.appleSecret) ||
              hasVal(process.env.APPLE_CLIENT_SECRET))
        ),
        clientId: dbConfig.social?.appleId || process.env.APPLE_ID || "",
        hasSecret: Boolean(
          hasVal(dbConfig.social?.appleSecret) ||
            hasVal(process.env.APPLE_CLIENT_SECRET)
        ),
      },
    },
  };

  const allTranslations = allDbTranslations.reduce(
    (acc, t) => {
      const namespace = t.key.split(".")[0];
      if (!acc[namespace]) acc[namespace] = [];
      acc[namespace].push(t);
      return acc;
    },
    {} as Record<string, Translation[]>
  );

  return {
    gateways,
    homepageSettings,
    contactSettings,
    allTranslations,
    safeConfig,
  };
}

export default async function SettingsPageServer() {
  const data = await getSettingsData();

  return (
    <div className="p-4 md:p-6 lg:px-8 h-[93vh] ">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage global configuration, translations, and integrations.
        </p>
      </div>

      <SettingsTabsClient
        gateways={data.gateways}
        contactSettings={data.contactSettings}
        homepageSettings={data.homepageSettings}
        allTranslations={data.allTranslations}
        safeConfig={data.safeConfig} // Pass the safe config
      />
    </div>
  );
}
