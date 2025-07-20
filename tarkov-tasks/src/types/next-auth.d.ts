// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `authorize` and available on `session.user`
   */
  interface User {
    /** Your database’s numeric ID */
    id: number;
  }

  interface Session extends DefaultSession {
    user: {
      /** Numeric ID from your database */
      id: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** We write this in `jwt` callback and read it in `session` */
    id?: string | number;
  }
}
