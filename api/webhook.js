import { runAgentLoop } from '../lib/agent.js';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Webhook is running.');
  }
  try {
    const { message } = req.body;
    if (!message || !message.text) {
      return res.status(200).send('OK');
    }
    const chatId = message.chat.id;
    const userText = message.text;
    console.log(`Received message from ${chatId}: ${userText}`);
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendChatAction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, action: "typing" })
    });
    const shouldPost = userText.toLowerCase().includes('post') && userText.toLowerCase().includes('channel');
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = host ? `${protocol}://${host}` : undefined;
    
    const { reply, toolsUsed } = await runAgentLoop(chatId, userText, baseUrl);
    let replyText = reply;

    if (shouldPost) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "-1004491535539",
          text: replyText
        })
      });
    }

    const finalReply = shouldPost ? `✅ Successfully posted to channel:\n\n${replyText}` : replyText;

    const teleRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: finalReply
      })
    });
    if (!teleRes.ok) {
      const errorData = await teleRes.text();
      console.error("Telegram Send Error:", errorData);
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send('Internal Server Error');
  }
}