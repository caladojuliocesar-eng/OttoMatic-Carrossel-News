import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('GOOGLE_SHEETS_WEBHOOK_URL não configurada no .env.local');
      return NextResponse.json({ error: 'Configuração do sistema ausente' }, { status: 500 });
    }

    // Encaminha os dados do formulário para o Google Apps Script de forma segura,
    // ocultando a URL real do usuário final.
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      // Algumas requisições fetch para o Apps Script podem dar erro de CORS se passarmos Content-Type, 
      // mas como o Apps Script em POST usa content body como JSON, texto puro (text/plain) ou nulo resolve.
      // E é vital não exigir headers complexos.
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      // follow: Google script redirects to an HTML page after POST, NextJS fetch handles it OK if redirected.
    });

    // O status HTTP normal de sucesso pra fetch no google script é 200, mas com redirc.
    const responseText = await response.text();
    let result = { status: 'success' }; // Default to success because Google returns weird HTML sometimes
    
    try {
      result = JSON.parse(responseText);
    } catch(e) { /* ignores, as Google might return a 200 OK with weird wrapper */ }


    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao salvar Lead na API Route:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
