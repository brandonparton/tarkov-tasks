// src/graphql/client.ts
import { GraphQLClient } from "graphql-request";

export const gqlClient = new GraphQLClient(
  process.env.TARKOV_GRAPHQL_URL!,
  { headers: {} }
);
