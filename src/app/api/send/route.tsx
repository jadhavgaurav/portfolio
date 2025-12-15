import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    console.log("API Route Hit");
    const apiKey = process.env.RESEND_API_KEY;
    console.log(`API Key status: ${apiKey ? "Present" : "Missing"} (${apiKey?.slice(0, 5)}...)`);

    if (!apiKey) {
        console.error("Missing RESEND_API_KEY");
        return NextResponse.json({ error: "Missing API configuration" }, { status: 500 });
    }

    try {
        const { message, senderEmail } = await request.json();
        console.log("Payload received:", { message, senderEmail });

        // Explicitly render the email template to HTML to avoid SDK issues
        const emailHtml = await render(<EmailTemplate message={message} senderEmail={senderEmail} />);

        const data = await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: ['gaurav.vjadhav01@gmail.com'],
            subject: 'New Inquiry from Portfolio',
            html: emailHtml,
        });

        console.log("Resend response:", data);

        if (data.error) {
            console.error("Resend returned error:", data.error);
            return NextResponse.json({ error: data.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("API Route Exception:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error }, { status: 500 });
    }
}
