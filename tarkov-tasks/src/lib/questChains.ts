// File: src/lib/questChains.ts
import { Quest } from "@/types/quest";

/**
 * Returns all linear chains (arrays of quest IDs) from root → leaf.
 */
export function getQuestChains(quests: Quest[]): string[][] {
  const chains: string[][] = [];
  const byId = Object.fromEntries(quests.map((q) => [q.id, q]));

  // find roots (no prerequisites)
  const roots = quests.filter((q) => q.requirements.length === 0);

  const dfs = (currentId: string, path: string[]) => {
    // find children that list currentId as a requirement
    const children = quests.filter((q) =>
      q.requirements.some((r) => r.id === currentId)
    );
    if (children.length === 0) {
      chains.push([...path]);
      return;
    }
    for (const child of children) {
      dfs(child.id, [...path, child.id]);
    }
  };

  for (const root of roots) {
    dfs(root.id, [root.id]);
  }

  return chains;
}

/**
 * Filter a list of chains to only those that begin with the given sequence.
 * E.g. filterChains(chains, ["Business","Big Sale"]) returns only chains
 * where chain[0]==="Business" and chain[1]==="Big Sale".
 * Also dedupes exact duplicates.
 */
export function filterChains(
  chains: string[][],
  prefix: string[]
): string[][] {
  const seen = new Set<string>();
  const filtered: string[][] = [];

  for (const chain of chains) {
    // must be at least as long as prefix
    if (
      prefix.every((id, i) => chain[i] === id)
    ) {
      const key = chain.join("→");
      if (!seen.has(key)) {
        seen.add(key);
        filtered.push(chain);
      }
    }
  }
  return filtered;
}
