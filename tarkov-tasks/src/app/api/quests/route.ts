// File: src/app/api/quests/route.ts
import { NextResponse } from "next/server";
import { gqlClient } from "@/graphql/client";
import { gql } from "graphql-request";
import type { Quest } from "@/types/quest";
import questsFallback from "../../../../public/quests.json";

const ALL_TASKS = gql`
  query AllTasks {
    tasks {
      id
      name
      minPlayerLevel
      trader { name }
      taskRequirements { task { id } }
      traderRequirements { requirementType }
      kappaRequired
      objectives {
        id
        type
        description
        maps { id name }

        ... on TaskObjectiveExperience { count }
        ... on TaskObjectiveExtract { count }
        ... on TaskObjectiveItem { count }
        ... on TaskObjectiveShoot { count }
      }
    }
  }
`;

interface GQLTask {
  id: string;
  name: string;
  minPlayerLevel: number;
  trader: { name: string };
  taskRequirements: { task: { id: string } }[];
  traderRequirements: { requirementType: string }[];
  kappaRequired?: boolean;
  objectives: Array<{
    id: string;
    type: string;
    description: string;
    count?: number;  // <-- optional
    maps: Array<{ id: string; name: string }>;
  }>;
}

export async function GET() {
  try {
    const { tasks } = await gqlClient.request<{ tasks: GQLTask[] }>(ALL_TASKS);

    const quests: Quest[] = tasks.map((t) => ({
      id: t.id,
      name: t.name,
      level: t.minPlayerLevel ?? 0,           // ← use minPlayerLevel here
      trader: t.trader.name,
      requirements: t.taskRequirements.map((r) => ({ id: r.task.id })),
      traderRequirements: t.traderRequirements.map((r) => ({ id: r.requirementType })),
      kappaRequired: t.kappaRequired ?? false, // optional field
      objectives: t.objectives.map((o) => ({
        id: o.id,
        type: o.type,
        description: o.description,
        count: o.count ?? null, // only for those that support it
        maps: o.maps.map((m) => ({ id: m.id, name: m.name })),
      })),
    }));

    return NextResponse.json(quests);
  } catch (err) {
    console.error(err);
    // on error, fall back to your static JSON, making sure it has the same shape
    const fallback: Quest[] = (questsFallback as any[]).map((q) => ({
      ...q,
      traderRequirements: q.traderRequirements ?? [],
    }));
    return NextResponse.json(fallback);
  }
}
