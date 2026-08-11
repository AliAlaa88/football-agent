import { searchDocuments } from './supabase.js';
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
async function getQueryEmbedding(query) {
  const vector = new Array(1536).fill(0);
  const words = query.toLowerCase().split(/\W+/);
  for (const word of words) {
    if (!word) continue;
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % 1536;
    vector[index] += 1;
  }
  const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return mag === 0 ? vector : vector.map(val => val / mag);
}
export const toolsSchema = [
  {
    type: "function",
    function: {
      name: "search_news",
      description: "Search the web for recent news, especially sports news.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query." }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "query_docs",
      description: "Query internal documents or database for specific stored knowledge.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The question to ask the database." }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "post_to_channel",
      description: "ONLY use this tool ONCE, when you have the FINAL, verified answer, to publish it to the public Telegram channel. NEVER use this tool to post status updates, thoughts, or placeholders.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "The message to post" }
        },
        required: ["message"]
      }
    }
  }
];
export async function executeTool(toolName, args) {
  console.log(`Executing tool: ${toolName} with args:`, args);
  if (toolName === "search_news") {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: args.query,
        search_depth: "basic",
        include_answer: true,
        max_results: 3
      })
    });
    if (!res.ok) throw new Error("Tavily search failed");
    const data = await res.json();
    return JSON.stringify(data.results);
  }
  if (toolName === "query_docs") {
    try {
      const embedding = await getQueryEmbedding(args.query);
      const docs = await searchDocuments(embedding, 0.0, 3);
      return JSON.stringify(docs);
    } catch (e) {
      return `Failed to query docs: ${e.message}`;
    }
  }
  if (toolName === "post_to_channel") {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "-1004491535539",
        text: args.message,
        parse_mode: "Markdown"
      })
    });
    const data = await res.json();
    if (!data.ok) return `Failed to post: ${data.description}`;
    return "Message posted successfully.";
  }
  throw new Error(`Unknown tool: ${toolName}`);
}