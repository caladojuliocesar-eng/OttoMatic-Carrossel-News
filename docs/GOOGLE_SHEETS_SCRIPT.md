# Instruções: Integração Google Sheets

Para que a captura de contatos (Leads) da Mini LP funcione e gere os Tokens de Convite automaticamente, siga os passos abaixo:

## Passo 1: Criar a Planilha
1. Abra o [Google Sheets](https://sheets.google.com) e crie uma nova planilha em branco.
2. Dê o nome que preferir (ex: "Leads Ottomatic VIP").
3. Na primeira linha (Cabeçalho), coloque exatamente as colunas na seguinte ordem:
   - A: Data
   - B: Nome
   - C: E-mail
   - D: WhatsApp
   - E: Token Gerado
   - F: Link Único

## Passo 2: Adicionar o Código (Apps Script)
1. No menu superior da planilha, clique em **Extensões > Apps Script**.
2. Apague qualquer código que estiver lá e cole o código abaixo:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto-gerar Token VIP (ex: vip-julio-3920)
    var timestamp = new Date().getTime().toString();
    var primeiroNome = data.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    var token = "vip-" + primeiroNome + "-" + timestamp.slice(-4);
    
    // URL Final do site (ajuste se mudar o domínio)
    var baseURL = "https://ottomatic-carousel.vercel.app/"; 
    var linkURL = baseURL + "?token=" + token;
    
    // Adicionar linha: [Data, Nome, Email, WhatsApp, Token, Link]
    sheet.appendRow([
      new Date(),
      data.name,
      data.email,
      data.whatsapp,
      token,
      linkURL
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Passo 3: Publicar e Pegar a URL
1. Clique no botão azul **Implantar (Deploy)** no canto superior direito e escolha **Nova Implantação**.
2. No ícone de engrenagem (Configurações), escolha o tipo **App da Web (Web app)**.
3. Preencha assim:
   - **Descrição**: Webhook Leads
   - **Executar como**: "Eu" (Seu e-mail)
   - **Quem pode acessar**: "Qualquer pessoa" (Isso é obrigatório para a API funcionar).
4. Clique em Implantar (ele pode pedir para você autorizar a conta do Google, aceite os alertas de segurança avançados).
5. Copie a **URL do App da Web** gerada.

## Passo 4: Configurar no Projeto
Volte para o projeto e cole essa URL no arquivo `.env.local` e lá na Vercel (Production) como:
`GOOGLE_SHEETS_WEBHOOK_URL="COLE_A_URL_AQUI"`
