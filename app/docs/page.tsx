"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Code, FileJson, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  const iframeCode = `<iframe 
  src="https://yourdomain.com/embed?url=https://github.com/facebook/react" 
  width="100%" 
  height="600px" 
  frameborder="0" 
  style="border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden;"
></iframe>`;

  return (
    <main className="min-h-screen bg-black text-white selection:bg-accent/30 selection:text-white relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <div className="max-w-3xl mx-auto px-6 py-20 relative z-10">
        <Link 
          href="/"
          className="inline-flex items-center space-x-2 text-white/50 hover:text-white transition-colors mb-12 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Visualizer</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-accent/20 border border-accent/20 rounded-full px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Developer Documentation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Integrating <br className="md:hidden" />
              Codebase Architect
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-xl">
              Embed interactive, AI-powered codebase architecture maps directly into your own applications, web pages, or internal tools.
            </p>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Section: The Embed Route */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Code className="w-5 h-5 text-white/80" />
              </div>
              <h2 className="text-2xl font-semibold">The `/embed` Route</h2>
            </div>
            <p className="text-white/70 leading-relaxed">
              Codebase Architect provides a specialized <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm text-accent">/embed</code> route that renders the graph visualizer without any of the landing page UI elements. It is designed to be responsive and will automatically fit the bounds of its container.
            </p>

            <div className="bg-black/50 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white/90">Basic Usage</h3>
              <p className="text-sm text-white/50">Simply pass the target GitHub repository URL via the <code>url</code> search parameter.</p>
              
              <div className="relative group">
                <pre className="bg-black/80 border border-white/5 rounded-xl p-4 text-sm text-white/80 overflow-x-auto word-break whitespace-pre-wrap">
                  {iframeCode}
                </pre>
              </div>
            </div>
          </div>

          {/* Section: Advanced Settings */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <Terminal className="w-5 h-5 text-white/80" />
              </div>
              <h2 className="text-2xl font-semibold">URL Parameters</h2>
            </div>
            
            <div className="grid gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white flex items-center space-x-2">
                      <span className="font-mono text-accent">url</span>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] uppercase font-bold rounded">Required</span>
                    </h4>
                    <p className="text-sm text-white/60 mt-1">The full URL to the public GitHub repository you wish to visualize.</p>
                    <p className="text-sm font-mono text-white/40 mt-2 bg-black/50 inline-block px-2 py-1 rounded">Example: https://github.com/vercel/next.js</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white flex items-center space-x-2">
                      <span className="font-mono text-accent">pat</span>
                      <span className="px-2 py-0.5 bg-white/10 text-white/50 text-[10px] uppercase font-bold rounded">Optional</span>
                    </h4>
                    <p className="text-sm text-white/60 mt-1">A GitHub Personal Access Token (PAT). Passing this parameter overrides the application's default token and allows the visualizer to fetch data from <strong>private repositories</strong> the token has access to.</p>
                    <p className="text-sm text-yellow-400/80 mt-2 flex items-center bg-yellow-400/10 inline-block px-3 py-1.5 rounded-lg border border-yellow-400/20">
                      <span className="font-semibold mr-2">Warning:</span> Do not expose your PAT in an iframe on a public website.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Internal API */}
          <div className="space-y-6 pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                <FileJson className="w-5 h-5 text-white/80" />
              </div>
              <h2 className="text-2xl font-semibold">Consuming the Raw API</h2>
            </div>
            <p className="text-white/70 leading-relaxed">
              If you just want the repository tree mapped out in a flat format suitable for D3, React Flow, or other libraries, you can make a `POST` request directly to the internal API route:
            </p>

            <div className="bg-black/50 border border-white/10 rounded-2xl p-6">
              <pre className="text-sm text-white/80 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
<span className="text-pink-400">fetch</span>(<span className="text-green-300">"/api/repo"</span>, {'{'}
  method: <span className="text-green-300">"POST"</span>,
  headers: {'{'} <span className="text-green-300">"Content-Type"</span>: <span className="text-green-300">"application/json"</span> {'}'},
  body: <span className="text-accent">JSON</span>.<span className="text-pink-400">stringify</span>({'{'}
    url: <span className="text-green-300">"https://github.com/owner/repo"</span>
  {'}'})
{'}'})
.then(res {`=>`} res.json())
.then(data {`=>`} console.log(data));
              </pre>
            </div>
          </div>

        </motion.div>
      </div>
    </main>
  );
}
