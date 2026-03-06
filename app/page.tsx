"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Activity, Sparkles, FolderGit2 } from "lucide-react";
import { GraphVisualizer, GithubNode } from "@/components/GraphVisualizer";
import { AgentExplanationPanel } from "@/components/AgentExplanationPanel";
import { FileSearch } from "@/components/FileSearch";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [repoData, setRepoData] = useState<{ owner: string; repo: string; tree: GithubNode[] } | null>(null);

  // App State for Agent Panel
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch repository");
      }

      setRepoData(data);
      setIsVisualizing(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (path: string, type: "tree" | "blob") => {
    if (type === "blob") { // Only explain files
      setSelectedFile(path);
      setIsPanelOpen(true);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col">
      {/* Background glow effects - hidden if visualizing full screen */}
      {!isVisualizing && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      {/* Main UI Area */}
      <AnimatePresence mode="wait">
        {!isVisualizing ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="z-10 w-full h-full flex flex-col items-center justify-center text-center space-y-10 px-6"
          >
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-white/80">Agentic Architecture Mapping</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 leading-tight">
              Codebase <br className="md:hidden" /> Architect
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Paste a public GitHub repository to instantly visualize its architecture and explore its purpose with an autonomous AI agent.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />

              <div className="relative flex items-center bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl">
                <Github className="w-6 h-6 text-white/40 ml-4 hidden sm:block" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="flex-1 bg-transparent border-none outline-none text-white px-4 py-4 text-lg placeholder:text-white/30"
                />
                <button
                  type="submit"
                  disabled={!url || isLoading}
                  className="bg-white text-black font-semibold px-8 py-4 rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95 min-w-[140px] justify-center"
                >
                  {isLoading ? (
                    <Activity className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Analyze</span>
                      <Activity className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="absolute -bottom-8 left-0 text-red-400 text-sm w-full text-center">
                  {error}
                </p>
              )}
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="graph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full relative"
          >
            {/* Nav Header over graph */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 pointer-events-none flex items-start space-x-4">
              <div className="inline-flex items-center space-x-3 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 pointer-events-auto">
                <FolderGit2 className="w-5 h-5 text-accent" />
                <div>
                  <h2 className="text-sm font-semibold text-white/90">{repoData?.owner} / {repoData?.repo}</h2>
                  <p className="text-xs text-muted-foreground hidden sm:block">Click any file node to awaken the Agent</p>
                </div>
                <button
                  onClick={() => setIsVisualizing(false)}
                  className="ml-4 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Search Panel */}
              {repoData && (
                <div className="pointer-events-auto">
                  <FileSearch tree={repoData.tree} onSelect={handleNodeClick} />
                </div>
              )}
            </div>

            {/* Visualizer Map */}
            {repoData && (
              <GraphVisualizer
                owner={repoData.owner}
                repo={repoData.repo}
                tree={repoData.tree}
                onNodeClick={handleNodeClick}
              />
            )}

            {/* AI Agent Panel overlay */}
            {repoData && (
              <AgentExplanationPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                filePath={selectedFile}
                repoContext={`${repoData.owner}/${repoData.repo}`}
              />
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
