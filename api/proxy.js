// Vercel serverless function — Ollama Cloud proxy (keeps the API key server-side).
// Deploy path in your repo: /api/proxy.js
// Set OLLAMA_API_KEY as an Environment Variable in Vercel (Settings → Environment Variables).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OLLAMA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OLLAMA_API_KEY not set in Vercel environment variables' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Ollama Cloud is OpenAI-compatible at https://ollama.com/v1
    const response = await fetch('https://ollama.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: body.model || 'gpt-oss:120b-cloud',
        messages: body.messages || [],
        max_tokens: body.max_tokens || 1500,
        stream: false,
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
