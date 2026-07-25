import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 requires an explicit driver adapter — `new PrismaClient()` with no
 * arguments throws. The adapter owns the pg connection pool.
 */
function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reuse one client across dev hot reloads so we don't exhaust the pool.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
