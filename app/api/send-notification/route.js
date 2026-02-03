import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { message } = await request.json();

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            return NextResponse.json({ success: false, error: 'Telegram configuration missing' }, { status: 500 });
        }

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API Error:', data);
            return NextResponse.json({ success: false, error: data.description }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Notification Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
