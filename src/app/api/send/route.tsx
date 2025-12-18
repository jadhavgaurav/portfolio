import { CreativeEmailTemplate } from '@/components/creative-email-template';
import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function POST(request: Request) {
    console.log("API Route Hit (Nodemailer)");

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
        console.error("Missing Gmail configuration");
        return NextResponse.json({ error: "Missing API configuration" }, { status: 500 });
    }

    try {
        const { message, email, name } = await request.json();
        console.log("Payload received:", { message, email, name });

        // 1. Send Email to Admin (Gaurav)
        const adminEmailHtml = await render(
            <CreativeEmailTemplate
                type="admin"
                name={name}
                email={email}
                message={message}
            />
        );

        const adminMailOptions = {
            from: `"Portfolio Contact" < ${gmailUser}> `,
            to: "gaurav.vjadhav01@gmail.com",
            subject: `[NEW TRANSMISSION] from ${name} `,
            html: adminEmailHtml,
        };

        const adminInfo = await transporter.sendMail(adminMailOptions);
        console.log("Admin email sent:", adminInfo.messageId);

        // 2. Send Confirmation Email to User
        const userEmailHtml = await render(
            <CreativeEmailTemplate
                type="user"
                name={name}
                email={email}
                message={message}
            />
        );

        const userMailOptions = {
            from: `"Gaurav Jadhav" < ${gmailUser}> `,
            to: email,
            subject: "[SYSTEM] Receipt Acknowledged // Protocol Initiated",
            html: userEmailHtml,
        };

        const userInfo = await transporter.sendMail(userMailOptions);
        console.log("User email sent:", userInfo.messageId);

        return NextResponse.json({ success: true, data: { admin: adminInfo.messageId, user: userInfo.messageId } });
    } catch (error) {
        console.error("API Route Exception:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error }, { status: 500 });
    }
}
