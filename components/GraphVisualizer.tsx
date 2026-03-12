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

import dagre from "dagre";
import { hierarchy, cluster } from "d3-hierarchy";

export type LayoutType = "radial" | "tree" | "cluster";

interface GraphVisualizerProps {
    owner: string;
    repo: string;
    tree: GithubNode[];
    layoutType: LayoutType;
    onNodeClick: (path: string, type: "tree" | "blob") => void;
}

export function GraphVisualizer({ owner, repo, tree, layoutType, onNodeClick }: GraphVisualizerProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    useEffect(() => {
        let newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        if (layoutType === "radial") {
            newNodes.push({
                id: "root",
                position: { x: 0, y: 0 },
                data: { label: `${owner}/${repo}`, isRoot: true },
                type: "customNode",
            });

            const sortedTree = [...tree].sort((a, b) => a.path.split("/").length - b.path.split("/").length);

            sortedTree.forEach((item, index) => {
                const parts = item.path.split("/");
                const name = parts[parts.length - 1];
                const parentId = parts.length === 1 ? "root" : parts.slice(0, -1).join("/");
                const depth = parts.length;

                const angle = (index * 137.5) * (Math.PI / 180);
                const radius = 150 * depth + Math.random() * 50;

                newNodes.push({
                    id: item.path,
                    position: {
                        x: Math.cos(angle) * radius,
                        y: Math.sin(angle) * radius,
                    },
                    data: { label: name, type: item.type, fullPath: item.path },
                    type: "customNode",
                });

                newEdges.push({
                    id: `e-${parentId}-${item.path}`,
                    source: parentId,
                    target: item.path,
                    animated: true,
                    style: { stroke: "rgba(255, 255, 255, 0.2)" },
                });
            });
        } else if (layoutType === "tree") {
            const dagreGraph = new dagre.graphlib.Graph();
            dagreGraph.setDefaultEdgeLabel(() => ({}));
            // TB = Top to Bottom
            dagreGraph.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 100 });

            // Add root
            dagreGraph.setNode("root", { width: 200, height: 40 });
            newNodes.push({
                id: "root",
                position: { x: 0, y: 0 },
                data: { label: `${owner}/${repo}`, isRoot: true },
                type: "customNode",
            });

            tree.forEach((item) => {
                const parts = item.path.split("/");
                const name = parts[parts.length - 1];
                const parentId = parts.length === 1 ? "root" : parts.slice(0, -1).join("/");

                dagreGraph.setNode(item.path, { width: 150, height: 40 });
                dagreGraph.setEdge(parentId, item.path);

                newNodes.push({
                    id: item.path,
                    position: { x: 0, y: 0 }, // Assigned later
                    data: { label: name, type: item.type, fullPath: item.path },
                    type: "customNode",
                });
                newEdges.push({
                    id: `e-${parentId}-${item.path}`,
                    source: parentId,
                    target: item.path,
                    animated: true,
                    style: { stroke: "rgba(255, 255, 255, 0.2)" },
                    type: "smoothstep"
                });
            });

            dagre.layout(dagreGraph);

            newNodes = newNodes.map((node) => {
                const nodeWithPosition = dagreGraph.node(node.id);
                return {
                    ...node,
                    position: {
                        x: nodeWithPosition.x - nodeWithPosition.width / 2,
                        y: nodeWithPosition.y - nodeWithPosition.height / 2,
                    },
                };
            });
        } else if (layoutType === "cluster") {
            // Build hierarchical parent-child object for d3
            
            interface HierarchyData {
                name: string;
                path: string;
                type?: string;
                children: HierarchyData[];
            }

            const hierarchyData: HierarchyData = { name: "root", path: "root", children: [] };
            const pathMap: Record<string, HierarchyData> = { "root": hierarchyData };

            // Sort paths so parents are processed before children
            const sortedTree = [...tree].sort((a, b) => a.path.length - b.path.length);

            sortedTree.forEach((item) => {
                const parts = item.path.split("/");
                const name = parts[parts.length - 1];
                const parentId = parts.length === 1 ? "root" : parts.slice(0, -1).join("/");

                const nodeObj = { name, path: item.path, type: item.type, children: [] };
                pathMap[item.path] = nodeObj;

                if (pathMap[parentId]) {
                    pathMap[parentId].children.push(nodeObj);
                }
            });

            // d3 hierarchy layout (circular dendrogram)
            const rootHierarchy = hierarchy(hierarchyData);
            const clusterLayout = cluster<HierarchyData>().size([2 * Math.PI, Math.max(800, tree.length * 5)]); // Angle (0 to 2PI), Radius
            
            clusterLayout(rootHierarchy);

            rootHierarchy.descendants().forEach((d) => {
                // Polar to Cartesian
                const angle = (d.x!) - Math.PI / 2;
                const radius = d.y!;
                const cx = radius * Math.cos(angle);
                const cy = radius * Math.sin(angle);

                newNodes.push({
                    id: d.data.path,
                    position: { x: cx, y: cy },
                    data: { 
                        label: d.data.name === "root" ? `${owner}/${repo}` : d.data.name, 
                        type: d.data.type, 
                        isRoot: d.data.name === "root",
                        fullPath: d.data.path 
                    },
                    type: "customNode",
                });
            });

            rootHierarchy.links().forEach((link) => {
                newEdges.push({
                    id: `e-${link.source.data.path}-${link.target.data.path}`,
                    source: link.source.data.path,
                    target: link.target.data.path,
                    animated: true,
                    style: { stroke: "rgba(255, 255, 255, 0.2)" },
                });
            });
        }

        setNodes(newNodes);
        setEdges(newEdges);
    }, [tree, owner, repo, layoutType, setNodes, setEdges]);

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
                        onNodeClick(node.data.fullPath as string, node.data.type as "tree" | "blob");
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
    const label = data.label as string;

    if (isRoot) Icon = Github;
    else if (isFolder) Icon = Folder;
    else if (label.endsWith(".json")) Icon = FileJson;
    else if (label.endsWith(".md")) Icon = FileText;
    else if (label.match(/\.(png|jpg|jpeg|svg|webp)$/)) Icon = ImageIcon;

    return (
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border backdrop-blur-md shadow-lg transition-all hover:scale-105 ${isRoot ? 'bg-primary/20 border-primary text-primary-foreground' :
            isFolder ? 'bg-white/5 border-white/20 text-white/80' :
                'bg-black/60 border-white/10 text-white/60 hover:text-white hover:border-accent'
            }`}>
            <Icon className="w-4 h-4" />
            <span className="text-xs font-mono font-medium max-w-[150px] truncate">{label}</span>
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
};

const nodeTypes = {
    customNode: CustomNode,
};
