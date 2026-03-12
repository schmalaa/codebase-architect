"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Activity, Sparkles, FolderGit2, Info, X, LayoutTemplate, Network, GitPullRequestDraft } from "lucide-react";
import { GraphVisualizer, GithubNode, LayoutType } from "@/components/GraphVisualizer";
import { AgentExplanationPanel } from "@/components/AgentExplanationPanel";
import { FileSearch } from "@/components/FileSearch";

export default function Home() {
  const [url, setUrl] = useState("");
  const [pat, setPat] = useState("");
  const [showPatHelp, setShowPatHelp] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [repoData, setRepoData] = useState<{ owner: string; repo: string; tree: GithubNode[] } | null>(null);

  const [layout, setLayout] = useState<LayoutType>("radial");

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
        body: JSON.stringify({ url, pat })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch repository");
      }

      setRepoData(data);
      setIsVisualizing(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
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

            <form onSubmit={handleSubmit} className="w-full max-w-2xl relative flex flex-col gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />

                <div className="relative flex flex-col sm:flex-row items-center bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl gap-2 sm:gap-0">
                  <div className="flex items-center flex-1 w-full">
                    <Github className="w-6 h-6 text-white/40 ml-2 sm:ml-4 hidden sm:block" />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://github.com/owner/repo"
                      className="w-full bg-transparent border-none outline-none text-white px-4 py-3 sm:py-4 text-base sm:text-lg placeholder:text-white/30"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!url || isLoading}
                    className="w-full sm:w-auto bg-white text-black font-semibold px-8 py-3 sm:py-4 rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-95 sm:min-w-[140px]"
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
              </div>

              <div className="relative bg-black/40 border border-white/10 backdrop-blur-xl rounded-xl p-1 shadow-lg mx-auto w-full sm:w-[80%] transition-opacity opacity-70 hover:opacity-100 focus-within:opacity-100">
                 <input
                    type="password"
                    value={pat}
                    onChange={(e) => setPat(e.target.value)}
                    placeholder="Provide a GitHub PAT to analyze private repositories (Optional)"
                    className="w-full bg-transparent border-none outline-none text-white px-4 py-2.5 text-sm placeholder:text-white/30 text-center"
                 />
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowPatHelp(!showPatHelp)}
                  className="inline-flex items-center space-x-1.5 text-xs text-white/40 hover:text-white/80 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>How to get a GitHub PAT</span>
                </button>
              </div>

              <AnimatePresence>
                {showPatHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-black/50 border border-white/10 backdrop-blur-xl rounded-xl p-5 text-left text-sm text-white/80 shadow-2xl relative mx-auto w-full sm:w-[80%]">
                      <button 
                        type="button" 
                        onClick={() => setShowPatHelp(false)}
                        className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
                         <Sparkles className="w-4 h-4 text-accent" />
                         <span>Creating a Personal Access Token</span>
                      </h3>
                      
                      <ol className="list-decimal list-outside ml-4 space-y-2 text-white/70">
                        <li>Go to <strong>GitHub Settings</strong> &gt; <strong>Developer Settings</strong> &gt; <strong>Personal access tokens</strong> &gt; <strong>Tokens (classic)</strong>.</li>
                        <li>Click <strong>Generate new token (classic)</strong>.</li>
                        <li>Give it a descriptive note (e.g., "Codebase Architect").</li>
                        <li>Under scopes, check the <strong>repo</strong> checkbox (this grants full control of private repositories).</li>
                        <li>Click <strong>Generate token</strong> at the bottom.</li>
                        <li>Copy the token and paste it here! <span className="text-xs text-accent mt-1 block">Your token is never stored and only used directly to fetch the repository state.</span></li>
                      </ol>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                <div className="pointer-events-auto flex items-center space-x-4">
                  
                  {/* Layout Picker */}
                  <div className="hidden sm:flex items-center bg-black/50 border border-white/10 backdrop-blur-xl rounded-xl p-1 shadow-lg">
                    {(["radial", "tree", "cluster"] as LayoutType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setLayout(type)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all ${
                          layout === type
                            ? "bg-white/10 text-white shadow-inner"
                            : "text-white/50 hover:text-white/80 hover:bg-white/5"
                        }`}
                      >
                        {type === "radial" && <Network className="w-4 h-4" />}
                        {type === "tree" && <GitPullRequestDraft className="w-4 h-4" />}
                        {type === "cluster" && <LayoutTemplate className="w-4 h-4" />}
                        <span className="capitalize">{type}</span>
                      </button>
                    ))}
                  </div>

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
                layoutType={layout}
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
