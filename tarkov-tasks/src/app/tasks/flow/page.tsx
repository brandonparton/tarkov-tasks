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

// === tweak these for tighter packing ===
const NODE_WIDTH = 160;
const NODE_HEIGHT = 48;
const NODE_SEP = 20;   // horizontal gap
const RANK_SEP = 40;   // vertical gap
const BAND_WIDTH = 3000;  // wide separation only matters between traders

// border & MiniMap palette
const PALETTE = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444"];

// ——— Trader header node ———
const TraderHeaderNode = memo(({ data }: NodeProps<{ trader: string }>) => {
  const key = data.trader.toLowerCase();
  return (
    <div
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        padding: 8,
        background: "#111827",
        border: "2px solid #374151",
        borderRadius: 6,
        textAlign: "center",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={`/traders/${key}.png`}
        alt={data.trader}
        style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 6 }}
        onError={(e) => void ((e.currentTarget as any).style.display = "none")}
      />
      <span style={{ color: "#f9fafb", fontWeight: 600 }}>{data.trader}</span>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#888", bottom: -4 }}
      />
    </div>
  );
});

// ——— Quest node w/ avatar + colored border ———
const QuestNode = memo(({ data }: NodeProps<{ label: string; trader: string }>) => {
  const hash = Array.from(data.trader).reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const borderColor = PALETTE[hash % PALETTE.length];
  const key = data.trader.toLowerCase();

  return (
    <div
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        padding: 6,
        background: "#1f2937",
        border: `2px solid ${borderColor}`,
        borderRadius: 4,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
      }}
    >
      <img
        src={`/traders/${key}.png`}
        alt={data.trader}
        style={{ width: 20, height: 20, borderRadius: "50%", marginRight: 6 }}
        onError={(e) => void ((e.currentTarget as any).style.display = "none")}
      />
      <span style={{ color: "#f9fafb", fontSize: 12, lineHeight: 1.2 }}>
        {data.label}
      </span>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#888", top: -4 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#888", bottom: -4 }}
      />
    </div>
  );
});

const nodeTypes = {
  traderHeader: TraderHeaderNode,
  questNode: QuestNode,
};

// ——— Locate the quest chain that at each fork picks “Part N+1” first, then longest ———
function getLongestPath(quests: Quest[]): string[] {
  const byId = new Map<string, Quest>();
  quests.forEach((q) => byId.set(q.id, q));

  const childrenMap = new Map<string, string[]>();
  quests.forEach((q) =>
    q.requirements.forEach((r) => {
      if (byId.has(r.id)) {
        const arr = childrenMap.get(r.id) || [];
        arr.push(q.id);
        childrenMap.set(r.id, arr);
      }
    })
  );

  function parsePart(name: string): { base: string; part?: number } {
    const m = name.match(/(.+?)\s*-\s*Part\s*(\d+)/i);
    if (!m) return { base: name.trim() };
    return { base: m[1].trim(), part: parseInt(m[2], 10) };
  }

  const memoLen = new Map<string, number>();
  const memoNext = new Map<string, string | null>();

  function dfs(id: string): number {
    if (memoLen.has(id)) return memoLen.get(id)!;
    const kids = childrenMap.get(id) || [];
    if (!kids.length) {
      memoLen.set(id, 1);
      memoNext.set(id, null);
      return 1;
    }

    // prefer exact next-part child
    const { base, part } = parsePart(byId.get(id)!.name);
    let pick: string | null = null;
    if (part != null) {
      pick = kids.find((cid) => {
        const p = parsePart(byId.get(cid)!.name);
        return p.base === base && p.part === part + 1;
      }) || null;
    }

    // otherwise pick the child with the deepest subtree
    if (!pick) {
      let best = 0;
      for (const cid of kids) {
        const len = dfs(cid);
        if (len > best) {
          best = len;
          pick = cid;
        }
      }
    }

    const total = 1 + (pick ? dfs(pick) : 0);
    memoLen.set(id, total);
    memoNext.set(id, pick);
    return total;
  }

  // start at all roots
  const roots = quests.filter((q) => q.requirements.length === 0).map((q) => q.id);
  let bestRoot: string | null = null, bestLen = 0;
  for (const r of roots) {
    const len = dfs(r);
    if (len > bestLen) {
      bestLen = len;
      bestRoot = r;
    }
  }

  // walk the pointers
  const path: string[] = [];
  let cur = bestRoot;
  while (cur) {
    path.push(cur);
    cur = memoNext.get(cur) || null;
  }
  return path;
}

export default function FlowPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/quests");
      const all: Quest[] = await res.json();

      // 1) group by trader
      const groups: Record<string, Quest[]> = {};
      all.forEach((q) => (groups[q.trader] ||= []).push(q));

      // 2) compute main chain & length per trader
      type Info = { trader: string; quests: Quest[]; path: string[]; length: number };
      const infos: Info[] = Object.entries(groups).map(([trader, qs]) => {
        const path = getLongestPath(qs);
        return { trader, quests: qs, path, length: path.length };
      });

      // 3) sort by descending length
      const sorted = infos.sort((a, b) => b.length - a.length);
      const allNodes: Node[] = [];
      const allEdges: Edge[] = [];
      const center = Math.floor(sorted.length / 2);

      sorted.forEach(({ trader, quests, path: mainChain }, idx) => {
        // column index: 0→center, 1→center-1,2→center+1…
        const band =
          idx === 0
            ? center
            : idx % 2
              ? center - ((idx + 1) >> 1)
              : center + (idx >> 1);
        const offsetX = band * BAND_WIDTH;

        // build & layout Dagre graph
        const g = new dagre.graphlib.Graph();
        g.setDefaultEdgeLabel(() => ({}));
        g.setGraph({ rankdir: "TB", nodesep: NODE_SEP, ranksep: RANK_SEP });

        quests.forEach((q) =>
          g.setNode(q.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
        );
        quests.forEach((q) =>
          q.requirements.forEach((r) => {
            if (!quests.find((x) => x.id === r.id)) return;
            const onMain =
              mainChain.includes(r.id) &&
              mainChain.includes(q.id) &&
              mainChain[mainChain.indexOf(r.id) + 1] === q.id;
            g.setEdge(r.id, q.id, { weight: onMain ? 100 : 1 });
          })
        );

        dagre.layout(g);

        // pin mainChain vertically
        mainChain.forEach((id) => {
          const n = g.node(id);
          if (n) n.x = NODE_WIDTH / 2;
        });

        // header
        allNodes.push({
          id: `header-${trader}`,
          type: "traderHeader",
          data: { trader },
          position: { x: offsetX, y: -NODE_HEIGHT * 2 },
        });

        // quest nodes
        quests.forEach((q) => {
          const n = g.node(q.id)!;
          const isMain = mainChain.includes(q.id);
          const spineX = n.x - NODE_WIDTH / 2 + offsetX;
          const finalX = isMain
            ? spineX
            : spineX + NODE_WIDTH + NODE_SEP;
          allNodes.push({
            id: q.id,
            type: "questNode",
            data: { label: q.name, trader },
            position: {
              x: finalX,
              y: n.y - NODE_HEIGHT / 2,
            },
          });
        });

        g.edges().forEach((e) =>
          allEdges.push({
            id: `e-${e.v}-${e.w}`,
            source: e.v,
            target: e.w,
            animated: true,
            style: { stroke: "#4b5563" },
          })
        );
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
