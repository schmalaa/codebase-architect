import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { rateLimit } from "@/lib/ratelimit";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        // Simple IP extraction (Vercel automatically adds x-forwarded-for)
        const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

        // Skip rate-limiting if the Redis URL is not set (e.g., local development without Upstash setup)
        if (process.env.UPSTASH_REDIS_REST_URL) {
            const { success } = await rateLimit.limit(ip);
            if (!success) {
                return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in an hour." }), { status: 429 });
            }
        }

        const { messages, repoContext, filePath } = await req.json();

        const systemPrompt = `You are a legendary, senior "Codebase Architect" AI. 
You are currently analyzing the repository: ${repoContext}.
The user has clicked on the file: \`${filePath}\`.
Explain what this file likely does in the context of this project. Be extremely concise, insightful, and "techy". Focus on architecture, patterns, and purpose. Avoid boilerplate pleasantries. Use markdown. Keep it under 150 words.`;

        const result = streamText({
            model: google("gemini-2.5-flash"),
            system: systemPrompt,
            messages,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("[Chat API] Error:", error);
        return new Response(JSON.stringify({ error: "Failed to stream" }), { status: 500 });
    }
}
