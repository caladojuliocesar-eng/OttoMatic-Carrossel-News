import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt é obrigatório.' }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY não configurada no servidor.' }, { status: 500 });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

        const payload = {
            instances: { prompt: prompt + " -- fotografia editorial, premium, sem texto, estilo documental, foco em ambientes, objetos ou silhuetas abstratas, altamente proibido rostos fotorrealistas, 21:9" },
            parameters: {
                sampleCount: 1,
                aspectRatio: "21:9"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Falha na API Imagen: ${response.status} - ${errorData}`);
        }

        const data = await response.json();

        if (!data || !data.predictions || !data.predictions[0]) {
            throw new Error("A IA não gerou a imagem (possível bloqueio por filtro de segurança).");
        }

        const imageUrl = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
        return NextResponse.json({ imageUrl });

    } catch (err) {
        console.error("Erro na rota /api/generate-image:", err);
        return NextResponse.json({ error: err.message || "Erro interno do servidor" }, { status: 500 });
    }
}
