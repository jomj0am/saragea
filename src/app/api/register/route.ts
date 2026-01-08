// app/api/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { rateLimiter } from "@/lib/rate-limit";
import { headers } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";

  try {
    await rateLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { name, email, password } = await req.json();

    // Uthibitishaji wa awali
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Angalia kama mtumiaji tayari yupo
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hashing ya password - HII NI LAZIMA KWA USALAMA
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tengeneza mtumiaji mpya kwenye database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TENANT", // Watumiaji wote wapya ni TENANT kwa default
      },
    });

    // Muhimu: Usirudishe password kwenye response!
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: "User registered successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
