// app/api/upload-signature/route.ts
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    const { folder } = await req.json();
    const timestamp = Math.round(new Date().getTime() / 1000);

    try {
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder },
            process.env.CLOUDINARY_API_SECRET!
        );
        return NextResponse.json({ signature, timestamp });
    } catch  {
        return NextResponse.json({ message: 'Failed to generate signature' }, { status: 500 });
    }
}