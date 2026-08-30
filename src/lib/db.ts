import { PrismaClient } from "@prisma/client";

// Singleton Prisma client — avoids exhausting connections in dev (hot reload)
// and on serverless. Uses the pooled DATABASE_URL at runtime.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
