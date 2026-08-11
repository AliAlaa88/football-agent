import { runAgentLoop } from '../lib/agent.js';

export default async function handler(req, res) {
  // Add CORS headers so we can access this from the frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Missing message or sessionId' });
    }

    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = host ? `${protocol}://${host}` : undefined;

    const { reply, toolsUsed } = await runAgentLoop(sessionId, message, baseUrl);

    return res.status(200).json({ reply, toolsUsed });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
