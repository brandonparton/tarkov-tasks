export interface Requirement {
  id: string;
}

export interface Objective {
  id: string;
  type: string;
  description: string;
  maps: { id: string; name: string }[];
}

export interface Quest {
  id: string;
  name: string;
  level: number;
  trader: string;

  /** task prereqs */
  requirements: Requirement[];

  /** trader-level prereqs (e.g. scavengersKarma) */
  traderRequirements: Requirement[];

  objectives: Objective[];
}
