// File: src/app/tasks/flow/page.tsx
"use client";

import React, { useEffect, useState, memo } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
} from "react-flow-renderer";
import dagre from "dagre";
import { Quest } from "@/types/quest";

// Node & layout constants
const NODE_WIDTH = 160;
const NODE_HEIGHT = 48;
const BAND_WIDTH = 5000;  // horizontal between trader columns
const NODE_SEP = 40;     // dagre horizontal sep
const RANK_SEP = 80;     // dagre vertical sep

// Color palette
const PALETTE = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444"];

// Trader header node w/avatar
const TraderHeaderNode = memo(({ data }: NodeProps<{ trader: string }>) => {
  const key = data.trader.toLowerCase();
  return (
    <div style={{
      width: NODE_WIDTH,
      padding: 8,
      background: "#111827",
      border: "2px solid #374151",
      borderRadius: 6,
      textAlign: "center",
    }}>
      <img
        src={`/traders/${key}.png`}
        alt={data.trader}
        style={{ width: 32, height: 32, borderRadius: "50%" }}
        onError={e => void ((e.currentTarget as any).style.display = "none")}
      />
      <div style={{ marginTop: 4, color: "#f9fafb", fontWeight: 600 }}>
        {data.trader}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: "#888", bottom: -4 }} />
    </div>
  );
});

// Quest node w/avatar + colored border
const QuestNode = memo(({ data }: NodeProps<{ label: string; trader: string }>) => {
  const key = data.trader.toLowerCase();
  const hash = data.trader.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const borderColor = PALETTE[hash % PALETTE.length];
  return (
    <div style={{
      display: "flex", alignItems: "center", width: NODE_WIDTH,
      padding: 6, background: "#1f2937", border: `2px solid ${borderColor}`, borderRadius: 4
    }}>
      <img
        src={`/traders/${key}.png`}
        alt={data.trader}
        style={{ width: 20, height: 20, borderRadius: "50%", marginRight: 6 }}
        onError={e => void ((e.currentTarget as any).style.display = "none")}
      />
      <div style={{ color: "#f9fafb", fontSize: 12, lineHeight: 1.2 }}>
        {data.label}
      </div>
      <Handle type="target" position={Position.Top} style={{ background: "#888", top: -4 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#888", bottom: -4 }} />
    </div>
  );
});

const nodeTypes = {
  traderHeader: TraderHeaderNode,
  questNode: QuestNode,
};

export default function FlowPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/quests");
      const allQuests: Quest[] = await res.json();

      // 1) Group quests by trader
      const groups: Record<string, Quest[]> = {};
      allQuests.forEach((q) => {
        groups[q.trader] = groups[q.trader] || [];
        groups[q.trader].push(q);
      });

      // 2) Compute each trader’s longest chain length
      const getLongest = (quests: Quest[]) => {
        const memo: Record<string, number> = {};
        const dfs = (id: string): number => {
          if (memo[id] != null) return memo[id];
          const q = quests.find((x) => x.id === id)!;
          const children = quests.filter((c) => c.requirements.some((r) => r.id === id));
          memo[id] = 1 + (children.length ? Math.max(...children.map((c) => dfs(c.id))) : 0);
          return memo[id];
        };
        const roots = quests.filter((q) => q.requirements.length === 0);
        return Math.max(...roots.map((r) => dfs(r.id)));
      };

      // 3) Sort traders by descending longest chain
      const sorted = Object.entries(groups)
        .map(([tr, lst]) => ({ trader: tr, quests: lst, length: getLongest(lst) }))
        .sort((a, b) => b.length - a.length);

      // 4) Build layout per trader with center-first offsets
      const allNodes: Node[] = [];
      const allEdges: Edge[] = [];
      const centerBand = Math.floor(sorted.length / 2);
      sorted.forEach(({ trader, quests }, idx) => {
        // position order: 0→center, 1→center-1,2→center+1,3→center-2,4→center+2...
        const offsetIndex = idx === 0
          ? centerBand
          : idx % 2
          ? centerBand - ((idx + 1) >> 1)
          : centerBand + (idx >> 1);
        const offsetX = offsetIndex * BAND_WIDTH;

        // dagre subgraph
        const g = new dagre.graphlib.Graph();
        g.setDefaultEdgeLabel(() => ({}));
        g.setGraph({ rankdir: "TB", nodesep: NODE_SEP, ranksep: RANK_SEP });

        // add nodes & same-trader edges
        quests.forEach((q) => g.setNode(q.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
        quests.forEach((q) => {
          q.requirements.forEach((r) => {
            if (quests.find((x) => x.id === r.id)) g.setEdge(r.id, q.id);
          });
        });

        dagre.layout(g);

        // header at top of this column
        allNodes.push({
          id: `header-${trader}`,
          type: "traderHeader",
          data: { trader },
          position: { x: offsetX, y: -NODE_HEIGHT * 2 },
        });

        // quest nodes
        quests.forEach((q) => {
          const { x, y } = g.node(q.id)!;
          allNodes.push({
            id: q.id,
            type: "questNode",
            data: { label: `${q.name} (Lv ${q.level})`, trader },
            position: { x: x - NODE_WIDTH / 2 + offsetX, y: y - NODE_HEIGHT / 2 },
          });
        });

        // edges
        g.edges().forEach((e) => {
          allEdges.push({
            id: `e-${e.v}-${e.w}`,
            source: e.v,
            target: e.w,
            animated: true,
            style: { stroke: "#4b5563" },
          });
        });
      });

      setNodes(allNodes);
      setEdges(allEdges);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p className="p-8 text-gray-200">Loading quest flow…</p>;
  }

  return (
    <div className="h-[90vh] w-full p-4 bg-gray-900 text-gray-100">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          snapToGrid
          snapGrid={[15, 15]}
        >
          <Background color="#374151" gap={16} />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as { trader: string };
              const hash = data.trader
                .split("")
                .reduce((sum, c) => sum + c.charCodeAt(0), 0);
              return PALETTE[hash % PALETTE.length];
            }}
            nodeStrokeWidth={1}
          />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
