import type { DefaultSession } from "next-auth";
import type { SystemRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      systemRole: SystemRole;
    } & DefaultSession["user"];
  }

  interface User {
    systemRole?: SystemRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    systemRole?: SystemRole;
  }
}

export {};
