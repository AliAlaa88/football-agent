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
    try {
      const errObj = JSON.parse(errorText);
      if (errObj.error && errObj.error.code === "tool_use_failed" && errObj.error.failed_generation) {
        const failedGen = errObj.error.failed_generation;
        const match = failedGen.match(/<function=([a-zA-Z0-9_]+)(.*?)><\/function>/);
        if (match) {
          const functionName = match[1];
          let args = match[2].trim();
          if (args.startsWith('(') && args.endsWith(')')) {
            args = args.substring(1, args.length - 1);
          }
          return {
            choices: [{
              message: {
                role: "assistant",
                content: "",
                tool_calls: [{
                  id: "call_" + Math.random().toString(36).substring(7),
                  type: "function",
                  function: {
                    name: functionName,
                    arguments: args
                  }
                }]
              }
            }]
          };
        }
      }
    } catch (e) {
      // Ignore parsing errors and throw original error
    }
    console.error("Groq API Error:", response.status, errorText);
    throw new Error(`Groq API Error: ${response.statusText}`);
  }
  return response.json();
}