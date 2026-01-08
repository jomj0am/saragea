import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { type Translation } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const translationsToUpdate = (await req.json()) as Translation[];

    if (!Array.isArray(translationsToUpdate)) {
      return NextResponse.json(
        { message: "Invalid payload. Expected an array of translations." },
        { status: 400 }
      );
    }

    // Use a transaction to update/create all translations at once
    const transactionPromises = translationsToUpdate.map((t) =>
      prisma.translation.upsert({
        // Using the composite unique constraint on [locale, key]
        where: {
          locale_key: {
            locale: t.locale,
            key: t.key,
          },
        },
        update: { value: t.value },
        create: {
          key: t.key,
          locale: t.locale,
          value: t.value,
        },
      })
    );

    await prisma.$transaction(transactionPromises);

    return NextResponse.json({ message: "Translations updated successfully" });
  } catch (error) {
    console.error("Failed to update translations:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
