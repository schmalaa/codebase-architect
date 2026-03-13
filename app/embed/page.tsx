"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Activity, FolderGit2 } from "lucide-react";
import { GraphVisualizer, GithubNode, LayoutType } from "@/components/GraphVisualizer";
import { AgentExplanationPanel } from "@/components/AgentExplanationPanel";
import { FileSearch } from "@/components/FileSearch";

function EmbedContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "";
  const pat = searchParams.get("pat") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repoData, setRepoData] = useState<{ owner: string; repo: string; tree: GithubNode[] } | null>(null);
  
  const [layout] = useState<LayoutType>("radial"); // Fixed layout for embedded view, or allow param later

  // App State for Agent Panel
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (!url) {
      setError("No repository URL provided");
      setIsLoading(false);
      return;
    }

    const fetchRepo = async () => {
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

    fetchRepo();
  }, [url, pat]);

  const handleNodeClick = (path: string, type: "tree" | "blob") => {
    if (type === "blob") {
      setSelectedFile(path);
      setIsPanelOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black/90 text-white">
        <Activity className="w-8 h-8 animate-spin text-accent mb-4" />
        <p className="text-white/60 text-sm">Loading repository...</p>
      </div>
    );
  }

  if (error || !repoData) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black/90 text-red-400 p-4 text-center">
        <p className="font-semibold">{error || "Failed to load"}</p>
        <p className="text-sm mt-2 text-white/40">URL provided: {url || "None"}</p>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black flex flex-col text-white">
      {/* Tiny Header for Context */}
      <div className="absolute top-0 left-0 right-0 p-3 z-20 pointer-events-none flex items-start justify-between">
        <div className="inline-flex items-center space-x-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 pointer-events-auto">
          <FolderGit2 className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold text-white/90">
            {repoData.owner} / {repoData.repo}
          </h2>
        </div>
        
        <div className="pointer-events-auto">
            <FileSearch tree={repoData.tree} onSelect={handleNodeClick} />
        </div>
      </div>

      {/* Visualizer Map */}
      <GraphVisualizer
        owner={repoData.owner}
        repo={repoData.repo}
        tree={repoData.tree}
        layoutType={layout}
        onNodeClick={handleNodeClick}
      />

      {/* AI Agent Panel overlay */}
      <AgentExplanationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        filePath={selectedFile}
        repoContext={`${repoData.owner}/${repoData.repo}`}
      />
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black/90 text-white">
        <Activity className="w-8 h-8 animate-spin text-accent mb-4" />
      </div>
    }>
      <EmbedContent />
    </Suspense>
  );
}
