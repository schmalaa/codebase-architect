<div align="center">
  <img src="https://assets.vercel.com/image/upload/v1607554385/repositories/next-js/next-logo.png" height="40" alt="Next.js logo" />
  <h1>Codebase Architect 🏗️✨</h1>
  <p><strong>Transform flat GitHub repositories into beautiful, interactive, AI-explained architectures.</strong></p>
  <br />
  <img src="public/preview.png" alt="Codebase Architect Preview" width="800" style="border-radius: 12px; box-shadow: 0 0 20px rgba(0,0,0,0.5);" />
</div>

---

## 🌟 What is this?

Codebase Architect is an experimental, visually-stunning tool designed to help developers instantly understand unfamiliar repositories. 

Instead of reading through endless folders of code, simply paste a public GitHub URL. The application will fetch the entire codebase structure and render it as an interactive, draggable node-graph.

**The Magic:** Click on any node (file) in the graph, and our embedded **Architect Agent** (powered by Google's cutting-edge Gemini 2.5 Flash model) will instantly stream a concise, "techy" explanation of exactly what architectural purpose that file serves within the broader project context.

## ✨ Features

- 🕸️ **Live Graph Rendering:** Automatically converts deep file-tree hierarchies into beautiful React Flow node graphs.
- 🤖 **AI Codebase Architect:** Built-in AI assistant using the Vercel AI SDK to explain complex files on demand.
- ⚡ **Lightning Fast Streams:** Real-time text streaming powered by Gemini 2.5 Flash.
- 🛡️ **Production Ready Rate Limits:** Hardened against abuse using Upstash Redis sliding-window IP limits.
- 💅 **Premium Aesthetics:** Dark-mode native, glassmorphism UI built with Tailwind CSS and Framer Motion micro-animations.

## 🛠️ Tech Stack

This project was built to showcase the bleeding edge of modern web and agentic technologies:

- **Framework:** Next.js (App Router) + React 19
- **Agentic AI:** Vercel AI SDK 3.0 + Google Gemini 2.5
- **Visualization:** React Flow (`@xyflow/react`)
- **Styling:** Tailwind CSS + Framer Motion + Lucide Icons
- **Infrastructure:** Vercel Edge + Upstash Redis (Ratelimits)

## 🚀 Getting Started

Want to run your own instance of the Architect? It takes 60 seconds to set up.

### Prerequisites
1. Node.js (v18+)
2. A free Google Gemini API Key (get one at [Google AI Studio](https://aistudio.google.com/))
3. *(Optional)* A free Upstash Redis database for Rate Limiting.

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and add your API Keys:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and configure your `GOOGLE_GENERATIVE_AI_API_KEY`.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:3000` and start exploring repositories!

## 💡 How it Works Under the Hood

1. **The Graph Engine:** The `/api/repo` route fetches the raw recursive Tree from the GitHub API. It strips out noise (like `.git` and `node_modules`), caps the payload to avoid browser crashing, and passes it to the frontend.
2. **The Layout Algorithm:** React Flow takes the linear files and dynamically calculates X/Y coordinates based on file depth and directory groupings, creating a spreading organic web.
3. **The AI Stream:** When a node is clicked, an isolated `/api/chat` request runs. It gives the AI the name of the file *and* the names of the other 500 files surrounding it (as context). The Vercel AI SDK then streams the explanation chunk-by-chunk back to the React UI, applying a `framer-motion` thinking state while connecting.

---

<div align="center">
  <p>Built with ❤️ by Alex as a showcase of modern agentic web development.</p>
</div>
