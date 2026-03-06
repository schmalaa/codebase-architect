"use client";

// Removed unused import
export interface Message {
    id: string;
    role: "user" | "assistant" | "system" | "data";
    content: string;
}
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Bot, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface AgentExplanationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filePath: string | null;
    repoContext: string;
}

export function AgentExplanationPanel({ isOpen, onClose, filePath, repoContext }: AgentExplanationPanelProps) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

    // We implement a basic fetch mechanism since useChat in 3.0 has removed standard App Router route hooks without experimental flags
    const runAgent = async (newMessages: Message[]) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages, repoContext, filePath }),
            });

            if (!res.body) throw new Error("No response body");

            // Simple text stream reader
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let currentAssistantMessage = "";

            // Create a placeholder for the assistant response
            const responseId = crypto.randomUUID();
            setMessages((prev) => [...prev, { id: responseId, role: "assistant", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                currentAssistantMessage += chunk;

                setMessages((prev) =>
                    prev.map(msg =>
                        msg.id === responseId
                            ? { ...msg, content: currentAssistantMessage }
                            : msg
                    )
                );
            }
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input, id: crypto.randomUUID() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");

        await runAgent(updatedMessages);
    };

    const messageEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && filePath) {
            // Reset state when opening a new file
            setMessages([]);
            const initialMsg: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: `Explain the architectural purpose of \`${filePath}\``
            };
            setMessages([initialMsg]);
            runAgent([initialMsg]);
        }
    }, [isOpen, filePath]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute top-4 bottom-4 left-4 sm:left-auto right-4 sm:w-[400px] z-50 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/50">
                                <Bot className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white flex items-center gap-1">
                                    Architect Agent <Sparkles className="w-3 h-3 text-accent" />
                                </h3>
                                <p className="text-xs text-white/50 truncate max-w-[200px]">{filePath}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm relative custom-scrollbar">
                        {messages.length === 0 && isLoading && (
                            <div className="flex items-center justify-center h-32 space-x-2 text-accent">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="animate-pulse">Analyzing architecture...</span>
                            </div>
                        )}
                        {messages.map((m: Message) => (
                            <div
                                key={m.id}
                                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-white/5 text-white border border-white/10 rounded-tl-sm text-sm leading-relaxed"
                                        }`}
                                >
                                    {m.role === "user" ? (
                                        m.content
                                    ) : m.content === "" ? (
                                        <div className="flex space-x-1.5 items-center h-5 px-1 py-0.5">
                                            <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} />
                                            <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.2 }} />
                                            <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.4 }} />
                                        </div>
                                    ) : (
                                        <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messageEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 bg-black/50">
                        <form onSubmit={handleSubmit} className="relative flex items-center">
                            <input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Ask about this file..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-white/30"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input}
                                className="absolute right-2 p-1.5 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
