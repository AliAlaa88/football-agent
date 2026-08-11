# Football Agent AI

A multi-tool AI Agent built from scratch to act as a World Cup 2026 expert. This project demonstrates advanced agentic workflows, RAG, and custom tool execution without relying on heavy abstractions like LangChain.

## Key Technical Achievements

*   **Autonomous ReAct Loop:** Designed and implemented a custom Reasoning & Acting loop that allows the LLM to dynamically decide when to search the internal database, when to browse the live web, or when to respond directly based on conversational context.
*   **Local Embeddings:** Deployed a completely local HuggingFace NLP pipeline (`@xenova/transformers`) running in WebAssembly. This generates high-quality semantic embeddings locally before storing them in Supabase.
*   **Vector Database (RAG):** Built a Retrieval-Augmented Generation pipeline using PostgreSQL + `pgvector` in Supabase to instantly search through unstructured markdown data.
*   **Conversational Memory:** Implemented a persistent chat history storage system in Supabase, giving the agent long-term memory of user contexts across different sessions.
*   **Seamless Production Integration:** Hosted on Vercel Serverless Functions and fully integrated into a live Telegram Bot Webhook for real-time user interaction.

## Tech Stack
*   **Logic & Routing:** Node.js, Vercel Serverless
*   **Intelligence:** Groq (Llama-3.3-70b-versatile)
*   **Embeddings:** HuggingFace `all-MiniLM-L6-v2` via Transformers.js (WebAssembly)
*   **Database:** Supabase (PostgreSQL, pgvector)
*   **External Data:** Tavily Search API
*   **Interface:** Telegram Bot API

## 🔮 Future Roadmap
*   **MCP (Model Context Protocol) Integration:** Currently, tools are hardcoded into the agent logic. The next evolution is to expose these tools (like `query_docs` and `search_news`) as an official **MCP Server**. This will decouple the tools from the Telegram bot, allowing any MCP-compatible client (like Claude Desktop or Cursor IDE) to connect to the agent's World Cup database and capabilities natively.

## Demo
![Screenshot 1](imgs/Screenshot%202026-08-11%20094812.png)
![Screenshot 2](imgs/Screenshot%202026-08-11%20094912.png)