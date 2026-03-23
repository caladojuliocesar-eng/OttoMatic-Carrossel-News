import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ valid: false }, { status: 400 });
        }

        const ownerToken = (process.env.OWNER_TOKEN || '').trim();

        if (ownerToken && token.trim() === ownerToken) {
            return NextResponse.json({ valid: true, isOwner: true });
        }

        const validTokens = (process.env.VIP_TOKENS || '').split(',').map(t => t.trim()).filter(Boolean);

        if (validTokens.includes(token)) {
            return NextResponse.json({ valid: true, isOwner: false });
        }

        return NextResponse.json({ valid: false });

    } catch (err) {
        console.error("Erro na rota /api/validate-token:", err);
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}
