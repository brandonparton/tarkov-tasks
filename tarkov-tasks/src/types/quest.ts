// src/types/quest.ts
export interface Quest {
  id: string;
  name: string;
  level: number;
  trader: string;
  requirements: { id: string }[];
}
