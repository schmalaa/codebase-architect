import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
    try {
        // Simple IP extraction (Vercel automatically adds x-forwarded-for)
        const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

        // Skip rate-limiting if the Redis URL is not set (e.g., local development without Upstash setup)
        if (process.env.UPSTASH_REDIS_REST_URL) {
            const { success } = await rateLimit.limit(ip);
            if (!success) {
                return NextResponse.json({ error: "Rate limit exceeded. Try again in an hour." }, { status: 429 });
            }
        }

        const { url } = await req.json();

        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        // Parse URL, expect https://github.com/owner/repo
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            return NextResponse.json({ error: "Could not parse GitHub owner/repo" }, { status: 400 });
        }

        const [, owner, repo] = match;

        // Remove .git if present
        const cleanRepo = repo.replace(/\.git$/, "");

        // Fetch default branch
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`);
        if (!repoRes.ok) {
            return NextResponse.json({ error: "Repository not found or access denied" }, { status: repoRes.status });
        }
        const repoData = await repoRes.json();
        const defaultBranch = repoData.default_branch || "main";

        // Fetch recursive tree
        const treeRes = await fetch(
            `https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/${defaultBranch}?recursive=1`
        );

        if (!treeRes.ok) {
            return NextResponse.json({ error: "Could not fetch repository tree" }, { status: treeRes.status });
        }

        const treeData = await treeRes.json();

        // Limit to 500 files to avoid massive graphs crashing the browser, and filter out node_modules/.git
        const filteredTree = treeData.tree
            .filter((item: { path: string; type: string }) => {
                // Skip hidden folders and common giant folders
                if (item.path.startsWith(".")) return false;
                if (item.path.includes("node_modules")) return false;
                if (item.path.includes("dist/") || item.path.includes("build/")) return false;
                return true;
            })
            .slice(0, 500);

        return NextResponse.json({
            owner,
            repo: cleanRepo,
            tree: filteredTree
        });

    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}
