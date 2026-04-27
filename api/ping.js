export default async function handler(req, res) {
  // Mengambil data dari Environment Variables Vercel
  const spaceUrl = process.env.SPACE_URL;
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;

  if (!spaceUrl) {
    return res.status(400).json({ error: "SPACE_URL belum diatur." });
  }

  try {
    // 1. Lakukan Ping ke Hugging Face dengan Header penyamaran
    const response = await fetch(spaceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      }
    });

    const status = response.status;
    const isSuccess = status === 200;
    
    // Format pesan notifikasi
    const timeInfo = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const message = isSuccess 
      ? `✅ [${timeInfo}] Ping Sukses! Status: ${status}. SearXNG aman.`
      : `⚠️ [${timeInfo}] Ping Gagal. Status: ${status}. Cek Space!`;

    // 2. Integrasi Telegram (Jalur API bot standar)
    if (tgToken && tgChatId) {
      const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
      await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: message
        })
      });
    }

    // 3. Integrasi Discord (Jalur Webhook)
    if (discordWebhook) {
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message
        })
      });
    }

    res.status(200).json({ success: true, status: status, log: message });

  } catch (error) {
    // Jika fetch gagal total (misal server down)
    const errorMsg = `🚨 Ping Error: ${error.message}`;
    
    if (discordWebhook) {
      await fetch(discordWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: errorMsg }) });
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
}
