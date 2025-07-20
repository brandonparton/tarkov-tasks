// src/app/api/quests/route.ts
import { NextResponse } from "next/server";
import { gqlClient } from "@/graphql/client";
import { gql } from "graphql-request";
import type { Quest } from "@/types/quest";
// relative path down from app/api/quests to public/quests.json:
import questsFallback from "../../../../public/quests.json";

const ALL_TASKS = gql`
  query AllTasks {
    tasks {
      id
      name
      minPlayerLevel
      trader {
        name
      }
      taskRequirements {
        task {
          id
        }
      }
    }
  }
`;

export async function GET() {
    try {
        const { tasks } = await gqlClient.request<{
            tasks: Array<{
                id: string;
                name: string;
                minPlayerLevel: number;
                trader: { name: string };
                taskRequirements: { task: { id: string } }[];
            }>;
        }>(ALL_TASKS);

        const quests: Quest[] = tasks.map((t) => ({
            id: t.id,
            name: t.name,
            level: t.minPlayerLevel ?? 1,
            trader: t.trader.name,
            requirements: t.taskRequirements.map((r) => ({ id: r.task.id })),
        }));

        return NextResponse.json(quests);
    } catch (err) {
        console.error("Error fetching from Tarkov.dev:", err);
        return NextResponse.json(questsFallback as Quest[]);
    }
}
