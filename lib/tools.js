import { pipeline } from '@xenova/transformers';
import { searchDocuments, hybridSearchDocuments } from './supabase.js';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

let extractor;
let reranker;

async function getQueryEmbedding(query) {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const output = await extractor(query, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

async function rerankResults(query, docs) {
  if (docs.length === 0) return docs;
  if (!reranker) {
    reranker = await pipeline('text-classification', 'Xenova/ms-marco-MiniLM-L-6-v2');
  }
  
  const inputs = docs.map(doc => [query, doc.content]);
  const scores = await reranker(inputs);
  
  for (let i = 0; i < docs.length; i++) {
    docs[i].rerank_score = scores[i].score; 
  }
  
  return docs.sort((a, b) => b.rerank_score - a.rerank_score);
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
      console.log(`Getting embedding for: ${args.query}`);
      const embedding = await getQueryEmbedding(args.query);
      
      console.log(`Running hybrid search...`);
      const docs = await hybridSearchDocuments(args.query, embedding, 15);
      
      console.log(`Reranking ${docs.length} results...`);
      const rerankedDocs = await rerankResults(args.query, docs);
      
      const topDocs = rerankedDocs.slice(0, 3);
      return JSON.stringify(topDocs);
    } catch (e) {
      return `Failed to query docs: ${e.message}`;
    }
  }
  throw new Error(`Unknown tool: ${toolName}`);
}