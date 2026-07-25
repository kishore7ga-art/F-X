import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { createPool } from "@/lib/db-pool";

function createPrismaClient() {
  // Prisma 7 requires an explicit driver adapter — `new PrismaClient()` with no
  // arguments throws. The pool is cloud-tuned; see db-pool.ts.
  return new PrismaClient({ adapter: new PrismaPg(createPool()) });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reuse one client across dev hot reloads so we don't exhaust the pool.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
