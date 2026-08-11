const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
if (!GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY in environment.");
}
export async function getChatCompletion(messages, tools = []) {
  const payload = {
    model: "llama-3.3-70b-versatile",
    messages,
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
    payload.tool_choice = "auto";
  }
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq API Error:", response.status, errorText);
    throw new Error(`Groq API Error: ${response.statusText}`);
  }
  return response.json();
}