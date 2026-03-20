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
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
        return NextResponse.json({ error: "Missing API configuration" }, { status: 500 });
    }

    try {
        const { message, email, name } = await request.json();

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
            from: `"Portfolio Contact" <${gmailUser}>`,
            to: "gaurav.vjadhav01@gmail.com",
            subject: `[NEW TRANSMISSION] from ${name}`,
            html: adminEmailHtml,
        };

        const adminInfo = await transporter.sendMail(adminMailOptions);

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
            from: `"Gaurav Jadhav" <${gmailUser}>`,
            to: email,
            subject: "[SYSTEM] Receipt Acknowledged // Protocol Initiated",
            html: userEmailHtml,
        };

        const userInfo = await transporter.sendMail(userMailOptions);

        return NextResponse.json({ success: true, data: { admin: adminInfo.messageId, user: userInfo.messageId } });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
