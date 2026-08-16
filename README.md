# Football Agent - [Live Demo](https://football-agent-rho.vercel.app/)

<video controls src="https://github.com/AliAlaa88/football-agent/blob/main/assets/demo.mp4?raw=true" width="100%"></video>

A multi-tool AI Agent built from scratch to act as a World Cup 2026 & Transfermarkt expert. It seamlessly combines LLM intelligence, local embeddings, and vector RAG (via Supabase) to deliver precise football insights without relying on heavy abstractions like LangChain.

## Key Technical Achievements

*   **ReAct Loop & LLM Tool Calling:** Designed and implemented a custom Reasoning & Acting loop that allows the LLM to dynamically decide when to search the internal database, when to browse the live web, or when to respond directly based on conversational context.
*   **Local Embeddings & HF Transformers:** Deployed a completely local HuggingFace NLP pipeline (`@xenova/transformers`) running in WebAssembly. This generates high-quality semantic embeddings locally before storing them in Supabase.
*   **Vector Database (RAG):** Built a Retrieval-Augmented Generation pipeline using PostgreSQL + `pgvector` in Supabase to instantly search through unstructured markdown data.
*   **Conversational Memory:** Implemented a persistent chat history storage system in Supabase, giving the agent long-term memory of user contexts across different sessions.
*   **Model Context Protocol Mock:** Integrated the [transfermarkt-api](https://github.com/felipeall/transfermarkt-api) as a set of dynamically executed local tools, enabling the agent to fetch live football statistics and player profiles.

## Tech Stack
*   **Logic & Routing:** Node.js, Python (FastAPI), Vercel Serverless
*   **Intelligence:** Groq API
*   **Embeddings:** HuggingFace Transformers.js (WebAssembly)
*   **Database:** Supabase (PostgreSQL, pgvector)
*   **External Data:** Tavily Search API, Transfermarkt API (via local Python MCP)
*   **Interfaces:** Telegram Bot API, Vanilla Web (HTML/CSS/JS)
