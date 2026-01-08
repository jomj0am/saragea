import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getSystemConfig } from "@/lib/config-helper";

export async function POST(req: Request) {
  const config = await getSystemConfig();

  // Ensure we have configuration
  if (
    !config.cloudinary.apiKey ||
    !config.cloudinary.apiSecret ||
    !config.cloudinary.cloudName
  ) {
    return NextResponse.json(
      { message: "Cloudinary is not configured in Admin Settings" },
      { status: 500 }
    );
  }

  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });

  try {
    const { folder } = await req.json();
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      config.cloudinary.apiSecret
    );

    // ✅ Return the apiKey and cloudName used for this specific signature
    return NextResponse.json({
      signature,
      timestamp,
      apiKey: config.cloudinary.apiKey,
      cloudName: config.cloudinary.cloudName,
    });
  } catch (error) {
    console.error("Signature Error:", error);
    return NextResponse.json(
      { message: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
