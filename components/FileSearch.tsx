"use client";

import { useState, useRef, useEffect } from "react";
import { Search, FileCode2 } from "lucide-react";
import type { GithubNode } from "./GraphVisualizer";

interface FileSearchProps {
    tree: GithubNode[];
    onSelect: (path: string, type: "tree" | "blob") => void;
}

export function FileSearch({ tree, onSelect }: FileSearchProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter strictly for files (blobs) matching the query
    const results = tree
        .filter(node => node.type === "blob" && node.path.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8); // Limit to top 8 results

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (node: GithubNode) => {
        setQuery("");
        setIsOpen(false);
        onSelect(node.path, node.type);
    };

    return (
        <div ref={wrapperRef} className="relative w-64 md:w-80 pointer-events-auto shadow-2xl">
            <div className="relative flex items-center bg-black/50 border border-white/10 rounded-xl backdrop-blur-xl transition-all focus-within:border-accent">
                <Search className="w-4 h-4 text-white/40 ml-3 shrink-0" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(e.target.value.length > 0);
                    }}
                    onFocus={() => {
                        if (query.length > 0) setIsOpen(true);
                    }}
                    placeholder="Search files..."
                    className="w-full bg-transparent border-none outline-none text-white text-sm px-3 py-2.5 placeholder:text-white/30"
                />
            </div>

            {/* Autocomplete Dropdown */}
            {isOpen && query.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-black/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    {results.length > 0 ? (
                        <ul className="max-h-64 overflow-y-auto custom-scrollbar py-1">
                            {results.map((node) => (
                                <li key={node.sha}>
                                    <button
                                        onClick={() => handleSelect(node)}
                                        className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center space-x-2 transition-colors group"
                                    >
                                        <FileCode2 className="w-4 h-4 text-white/40 group-hover:text-accent shrink-0" />
                                        <span className="text-xs text-white/80 font-mono truncate">{node.path}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-xs text-white/40 text-center">
                            No files found matching "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
