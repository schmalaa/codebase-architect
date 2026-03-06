"use client";

import { useCallback, useEffect } from "react";
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    Handle,
    Position
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Folder, FileCode2, FileJson, FileText, Image as ImageIcon, Github } from "lucide-react";

export interface GithubNode {
    path: string;
    mode: string;
    type: "tree" | "blob";
    sha: string;
    size?: number;
    url: string;
}

interface GraphVisualizerProps {
    owner: string;
    repo: string;
    tree: GithubNode[];
    onNodeClick: (path: string, type: "tree" | "blob") => void;
}

// Convert flat github tree to nodes and edges using a simple physical layout algorithm
// For a better layout, we could use d3-hierarchy or dagre, but we'll do a simple radial or tree layout.

export function GraphVisualizer({ owner, repo, tree, onNodeClick }: GraphVisualizerProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    useEffect(() => {
        // Basic root node
        const initialNodes: Node[] = [
            {
                id: "root",
                position: { x: 0, y: 0 },
                data: { label: `${owner}/${repo}`, isRoot: true },
                type: "customNode", // We will build a custom node
            },
        ];
        const initialEdges: Edge[] = [];

        // To make a decent graph, we map paths
        const levels: Record<string, string[]> = { root: [] };

        // Sort tree by path depth
        const sortedTree = [...tree].sort((a, b) => a.path.split("/").length - b.path.split("/").length);

        sortedTree.forEach((item, index) => {
            const parts = item.path.split("/");
            const name = parts[parts.length - 1];
            const parentId = parts.length === 1 ? "root" : parts.slice(0, -1).join("/");
            const depth = parts.length;

            // We generate somewhat random positioning for now within a radius
            const angle = (index * 137.5) * (Math.PI / 180); // Fibonacci spiral
            const radius = 150 * depth + Math.random() * 50;

            initialNodes.push({
                id: item.path,
                position: {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                },
                data: { label: name, type: item.type, fullPath: item.path },
                type: "customNode",
            });

            initialEdges.push({
                id: `e-${parentId}-${item.path}`,
                source: parentId,
                target: item.path,
                animated: true,
                style: { stroke: "rgba(255, 255, 255, 0.2)" },
            });
        });

        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [tree, owner, repo, setNodes, setEdges]);

    // We should create a custom node type here so it uses Lucide icons and dark styling
    return (
        <div className="w-full h-full text-foreground bg-background rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_, node) => {
                    if (node.id !== "root") {
                        onNodeClick(node.data.fullPath as string, node.data.type as any);
                    }
                }}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background gap={12} size={1} color="rgba(255, 255, 255, 0.1)" />
                <Controls className="bg-white/5 border border-white/10 fill-white" />
            </ReactFlow>
        </div>
    );
}

// Custom Node Definition using our styling
import type { NodeProps } from "@xyflow/react";

const CustomNode = ({ data }: NodeProps) => {
    const isRoot = data.isRoot as boolean;
    const isFolder = data.type === "tree";

    let Icon = FileCode2;
    if (isRoot) Icon = Github;
    else if (isFolder) Icon = Folder;
    else if (data.label.endsWith(".json")) Icon = FileJson;
    else if (data.label.endsWith(".md")) Icon = FileText;
    else if (data.label.match(/\.(png|jpg|jpeg|svg|webp)$/)) Icon = ImageIcon;

    return (
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border backdrop-blur-md shadow-lg transition-all hover:scale-105 ${isRoot ? 'bg-primary/20 border-primary text-primary-foreground' :
            isFolder ? 'bg-white/5 border-white/20 text-white/80' :
                'bg-black/60 border-white/10 text-white/60 hover:text-white hover:border-accent'
            }`}>
            <Icon className="w-4 h-4" />
            <span className="text-xs font-mono font-medium max-w-[150px] truncate">{data.label}</span>
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
};

const nodeTypes = {
    customNode: CustomNode,
};
