# Football Agent ⚽🤖

<video src="https://github.com/AliAlaa88/football-agent/raw/main/assets/demo.mp4" controls width="100%"></video>

A multi-tool AI Agent built from scratch to act as a World Cup 2026 & Transfermarkt expert. It seamlessly combines LLM intelligence, local embeddings, and vector RAG (via Supabase) to deliver precise football insights without relying on heavy abstractions like LangChain.

## Skills & Technologies
* **ReAct Agent Architecture:** Custom LLM routing and tool-calling loop.
* **Retrieval-Augmented Generation (RAG):** Querying unstructured markdown for World Cup 2026 data.
* **Local Embeddings:** Running HuggingFace `all-MiniLM-L6-v2` locally via WebAssembly (`Transformers.js`).
* **Vector Databases:** Storing and searching embeddings in Supabase (`pgvector`).
* **Multi-Runtime Deployment:** Running Node.js (bot logic) and Python (Transfermarkt API) seamlessly on Vercel Serverless.
* **LLM Integration:** Groq high-speed inference (Llama-3 models).
* **Live Search & External APIs:** Integrating Tavily Search and Transfermarkt APIs.
* **Conversational Memory:** Persistent chat history stored in Supabase PostgreSQL.
* **Vanilla UI:** Custom Glassmorphism web chat interface built with pure HTML/CSS/JS.
