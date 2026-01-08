import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "SETTINGS_CHANGE";
type AuditResource =
  | "PROPERTY"
  | "ROOM"
  | "LEASE"
  | "TENANT"
  | "FINANCE"
  | "SYSTEM";

export async function logAction(
  userId: string,
  action: AuditAction,
  resource: AuditResource,
  details: string
) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        details,
        ipAddress: ip,
      },
    });
  } catch (e) {
    console.error("Failed to write audit log:", e);
    // Don't crash the app if logging fails
  }
}
