"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import { useState } from "react";

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export function EmbedModal({ isOpen, onClose, url }: EmbedModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate the embed URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `${baseUrl}/embed?url=${encodeURIComponent(url)}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="600px" frameborder="0" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden;"></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-white mb-2">Embed this Map</h2>
            <p className="text-sm text-white/60 mb-6">
              Copy this code to embed the Codebase Architect interactive map into your website or documentation.
            </p>

            <div className="relative group">
              <pre className="bg-black/50 border border-white/5 rounded-xl p-4 text-sm text-white/80 overflow-x-auto whitespace-pre-wrap word-break">
                {iframeCode}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white transition-all backdrop-blur-md"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-xs text-white/40">
                <span>The iframe will adjust to the width of its container.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
