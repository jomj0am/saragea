// src/lib/pusher.ts
import PusherServer from "pusher";
import PusherClient from "pusher-js";

interface PusherConfig {
  appId?: string;
  key?: string;
  secret?: string;
  cluster?: string;
}

/**
 * Server-side Pusher Initializer
 * Accepts a config object (usually from the Database)
 */
export const getPusherServer = (config?: PusherConfig) => {
  // Use passed config OR fallback to environment variables
  const appId = config?.appId || process.env.PUSHER_APP_ID;
  const key = config?.key || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = config?.secret || process.env.PUSHER_SECRET;
  const cluster = config?.cluster || process.env.PUSHER_CLUSTER || "ap2";

  // Prevent crashing during build or if config is missing
  if (
    !appId ||
    appId === "placeholder" ||
    !key ||
    key === "placeholder" ||
    !secret ||
    secret === "placeholder"
  ) {
    return null;
  }

  return new PusherServer({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
};

/**
 * Client-side Pusher Initializer
 */
export const getPusherClient = () => {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.PUSHER_CLUSTER || "ap2";

  // Only run in the browser and only if the key is valid
  if (typeof window === "undefined" || !key || key === "placeholder") {
    return null;
  }

  return new PusherClient(key, { cluster });
};
