// app/[locale]/api/contact/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as z from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);
const contactFormSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    subject: z.string().min(4),
    message: z.string().min(10),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = contactFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { name, email, subject, message } = validation.data;

        await resend.emails.send({
    from: 'Contact Form <noreply@yourdomain.com>',
    to: process.env.ADMIN_EMAIL!,
    subject: `New Contact Message: ${subject}`,
    replyTo: email, 
    html: `
        <h1>New Message from SARAGEA Website</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr />
        <p><strong>Message:</strong></p>eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
        <p>${message}</p>
    `,
});


        return NextResponse.json({ message: 'Message sent successfully!' });

    } catch (error: unknown) { // Badilisha 'error' iwe 'unknown'
    console.error("Contact Form API Error:", error); // Itumie hapa
    return NextResponse.json({ message: 'Failed to send message' }, { status: 500 });
}
}