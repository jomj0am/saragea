import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getSystemConfig } from "@/lib/config-helper";
import { Resend } from "resend";
import { v2 as cloudinary } from "cloudinary";
import Pusher from "pusher";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // 1. Security Check
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const proposedChanges = await req.json();

    // 2. Get Current Config to merge with (handling empty strings from UI)
    const currentConfig = await getSystemConfig();

    // 3. Merge: If proposed value is undefined/empty, keep the current one
    const finalConfig = {
      resend: {
        apiKey: proposedChanges.resend?.apiKey || currentConfig.resend.apiKey,
        fromEmail:
          proposedChanges.resend?.fromEmail || currentConfig.resend.fromEmail,
      },
      cloudinary: {
        cloudName:
          proposedChanges.cloudinary?.cloudName ||
          currentConfig.cloudinary.cloudName,
        apiKey:
          proposedChanges.cloudinary?.apiKey || currentConfig.cloudinary.apiKey,
        apiSecret:
          proposedChanges.cloudinary?.apiSecret ||
          currentConfig.cloudinary.apiSecret,
      },
      pusher: {
        appId: proposedChanges.pusher?.appId || currentConfig.pusher.appId,
        key: proposedChanges.pusher?.key || currentConfig.pusher.key,
        secret: proposedChanges.pusher?.secret || currentConfig.pusher.secret,
        cluster:
          proposedChanges.pusher?.cluster || currentConfig.pusher.cluster,
      },
    };

    const errors: string[] = [];

    // 4. VALIDATE RESEND
    if (finalConfig.resend.apiKey) {
      try {
        const resend = new Resend(finalConfig.resend.apiKey);
        // Attempt to fetch domains to verify key validity
        await resend.domains.list();
      } catch (e) {
        console.error("Resend Validation Error:", e);
        errors.push(
          "Resend API Key is invalid or has insufficient permissions."
        );
      }
    }

    // 5. VALIDATE CLOUDINARY
    if (
      finalConfig.cloudinary.cloudName &&
      finalConfig.cloudinary.apiKey &&
      finalConfig.cloudinary.apiSecret
    ) {
      try {
        cloudinary.config({
          cloud_name: finalConfig.cloudinary.cloudName,
          api_key: finalConfig.cloudinary.apiKey,
          api_secret: finalConfig.cloudinary.apiSecret,
        });
        await cloudinary.api.ping();
      } catch (e) {
        console.error("Cloudinary Validation Error:", e);
        errors.push("Cloudinary credentials are invalid.");
      }
    }

    // 6. VALIDATE PUSHER
    if (
      finalConfig.pusher.appId &&
      finalConfig.pusher.key &&
      finalConfig.pusher.secret &&
      finalConfig.pusher.cluster
    ) {
      try {
        // Pusher constructor throws immediately if required fields are missing
        // To test validity, we can try to "trigger" a dummy event or simply instantiate
        new Pusher({
          appId: finalConfig.pusher.appId,
          key: finalConfig.pusher.key,
          secret: finalConfig.pusher.secret,
          cluster: finalConfig.pusher.cluster,
          useTLS: true,
        });
      } catch (e) {
        console.error("Pusher Validation Error:", e);
        errors.push("Pusher configuration format is invalid.");
      }
    }

    // 7. Return Result
    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 200 }); // Return 200 so frontend can parse the JSON error list easily
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Validation Internal Error:", error);
    return NextResponse.json(
      { success: false, errors: ["Internal validation error occurred."] },
      { status: 500 }
    );
  }
}
