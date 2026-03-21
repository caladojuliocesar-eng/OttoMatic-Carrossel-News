import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req) {
    try {
        const { theme, slideCount } = await req.json();

        if (!theme) {
            return NextResponse.json({ error: 'Tema ou URL é obrigatório.' }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY não configurada no servidor.' }, { status: 500 });
        }

        let isUrl = false;
        let contentToProcess = theme;

        // Verifica se é uma URL
        if (theme.trim().toLowerCase().startsWith('http')) {
            isUrl = true;
            try {
                // Fetch using Jina Reader
                const jinaResponse = await fetch(`https://r.jina.ai/${theme.trim()}`);
                if (jinaResponse.ok) {
                    contentToProcess = await jinaResponse.text();
                } else {
                    console.warn("Jina Reader falhou, usando a URL crua como fallback.");
                }
            } catch (e) {
                console.error("Erro ao acessar Jina:", e);
            }
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        // Prompt condicional
        let systemPrompt = `Você é um diretor de arte, copywriter de elite e estrategista de social media. 
        O usuário vai te dar um tema ou uma reportagem. Sua missão é criar o conteúdo de um carrossel E as legendas para as redes sociais.
        
        A linguagem DEVE ser: elegante, baseada em dados reais (se fornecidos), focada em negócios, com tom premium.
        ATENÇÃO: Escreva em Português do Brasil IMPECÁVEL. Use acentuação correta. NUNCA gere palavras bugadas como "INTELIG!NCIA".
        
        ### REGRAS DO CARROSSEL
        Categorize rigorosamente cada slide em UM destes 4 layouts:
        1. "capa": Slide 1 obrigatório.
        2. "texto_imagem": Desenvolvimento. Headline em cima, imagem no meio, texto base.
        3. "so_texto": Foco total na copy.
        4. "impacto": O slide de respiro e virada de chave. Fundo colorido, sem imagem.

        Estrutura sugerida:
        - Slide 1 inevitavelmente "capa".
        - Último Slide: "texto_imagem" ou "impacto", focando na Conclusão.
        - Pelo menos um slide no meio: "impacto".
        
        `;

        if (isUrl) {
            systemPrompt += `
            *** ATENÇÃO: MODO NOTÍCIA DETECTADO ***
            O usuário enviou uma reportagem ou artigo (extraído via Crawler). 
            1. IGNORe a quantidade de slides pedida. Baseado na profundidade do texto, DECIDA VOCÊ a quantidade ideal de slides (entre 4 e 10 slides) para resumir perfeitamente o artigo sem ser raso nem enrolar.
            2. Extraia o nome do Veículo/Portal e o Autor (se houver) e preencha o campo "credito_extraido" no formato: "Fonte: [Nome do Veículo] | Por [Autor]". Se não tiver autor, apenas "Fonte: [Veículo]".
            `;
        } else {
            systemPrompt += `
            Você DEVE criar EXATAMENTE ${slideCount} slides, nem um a mais, nem um a menos.
            O campo "credito_extraido" deve retornar uma string vazia "".
            `;
        }

        systemPrompt += `
        ### REGRAS DAS LEGENDAS
        - legenda_linkedin: Formato mini-artigo provocativo. Gancho forte nas primeiras linhas para fazer a pessoa clicar no PDF do carrossel.
        - legenda_instagram: Formato para retenção e engajamento. Escaneável, com Emojis. Termine incentivando comentários.

        Responda ESTRITAMENTE em formato JSON contendo o schema abaixo:`;

        const payload = {
            contents: [{ parts: [{ text: `Conteúdo original fornecido: ${contentToProcess}` }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        slides: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    slide: { type: "INTEGER" },
                                    layout: {
                                        type: "STRING",
                                        enum: ["capa", "texto_imagem", "so_texto", "impacto"],
                                        description: "Obrigatório escolher um dos 4 layouts exatos."
                                    },
                                    titulo: { type: "STRING", description: "Headline. Para 'capa' e 'impacto', faça BEM curto e forte." },
                                    texto_apoio: { type: "STRING", description: "O body text. Na capa, use como lide ou frase de impacto. No impacto, algo curto." },
                                    sugestao_visual: { type: "STRING", description: "Prompt detalhado (em INGLÊS) para IA gerar imagem. Foco em metáforas, objetos, arquitetura. EVITE rostos." }
                                },
                                required: ["slide", "layout", "titulo", "texto_apoio"]
                            }
                        },
                        legenda_linkedin: { type: "STRING" },
                        legenda_instagram: { type: "STRING" },
                        credito_extraido: { type: "STRING", description: "Crédito da notícia se for URL, senão retorne string vazia." }
                    },
                    required: ["slides", "legenda_linkedin", "legenda_instagram"]
                }
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Falha na API Gemini: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            throw new Error("A IA respondeu vazio.");
        }

        const sanitizedText = generatedText.replace(/!NCIA/g, 'ÊNCIA').replace(/!ncia/g, 'ência');
        const parsedData = JSON.parse(sanitizedText);
        
        return NextResponse.json(parsedData);

    } catch (err) {
        console.error("Erro na rota /api/generate-carousel:", err);
        return NextResponse.json({ error: err.message || "Erro interno do servidor" }, { status: 500 });
    }
}
