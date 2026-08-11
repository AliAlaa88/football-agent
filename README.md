# Football Agent

A multi-tool AI Agent built from scratch to act as a World Cup 2026 & Transfermarkt expert. It seamlessly combines LLM intelligence, local embeddings, and vector RAG (via Supabase) to deliver precise football insights without relying on heavy abstractions like LangChain.

## Key Technical Achievements

*   **Autonomous ReAct Loop:** Designed and implemented a custom Reasoning & Acting loop that allows the LLM to dynamically decide when to search the internal database, when to browse the live web, or when to respond directly based on conversational context.
*   **Local Embeddings:** Deployed a completely local HuggingFace NLP pipeline (`@xenova/transformers`) running in WebAssembly. This generates high-quality semantic embeddings locally before storing them in Supabase.
*   **Vector Database (RAG):** Built a Retrieval-Augmented Generation pipeline using PostgreSQL + `pgvector` in Supabase to instantly search through unstructured markdown data.
*   **Conversational Memory:** Implemented a persistent chat history storage system in Supabase, giving the agent long-term memory of user contexts across different sessions.
*   **Model Context Protocol (MCP) Mock:** Integrated the [transfermarkt-api](https://github.com/felipeall/transfermarkt-api) as a set of dynamically executed local tools, enabling the agent to fetch live football statistics and player profiles.
*   **Multi-Runtime Vercel Deployment:** Hosted on Vercel Serverless Functions running both Node.js (for the Telegram Bot Webhook) and Python (for the Transfermarkt API) in a single deployment.

## Tech Stack
*   **Logic & Routing:** Node.js & Python (FastAPI), Vercel Serverless
*   **Intelligence:** Groq (Llama-3.3-70b-versatile)
*   **Embeddings:** HuggingFace `all-MiniLM-L6-v2` via Transformers.js (WebAssembly)
*   **Database:** Supabase (PostgreSQL, pgvector)
*   **External Data:** Tavily Search API, Transfermarkt API (via local Python MCP)
*   **Interface:** Telegram Bot API

## Demo
![Screenshot 1](imgs/Screenshot%202026-08-11%20094812.png)
![Screenshot 2](imgs/Screenshot%202026-08-11%20094912.png)
![Transfermarkt API Integration](imgs/image.png)
*Demonstrating live data fetched from the Transfermarkt API.*
