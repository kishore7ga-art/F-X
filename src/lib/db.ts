import { PrismaClient } from "@/generated/prisma";

function createPrismaClient() {
  /**
   * No driver adapter. Prisma publishes none for MongoDB — the connector talks
   * to the cluster itself, so the connection string is passed straight through
   * and db-pool.ts (a `pg` Pool, TLS inference, connection caps) has nothing
   * left to do here.
   */
  // Prisma 6 reads the connection string from the datasource block, which
  // takes env("DATABASE_URL"). No driver adapter: none exists for MongoDB, and
  // the connector talks to the cluster itself.
  return new PrismaClient();
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Lazily-constructed Prisma client.
 *
 * Constructing eagerly at module scope would read DATABASE_URL as soon as any
 * route imports this file — including during `next build`, which imports every
 * route module to collect page data. The database is not reachable (and the
 * URL not set) at build time, so that turned a perfectly valid build into
 * "Failed to collect page data". Deferring construction to the first actual
 * query keeps the build environment-free while behaving identically at runtime.
 *
 * The instance is cached on globalThis so dev hot reloads reuse one pool.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getClient();
    const value = Reflect.get(client, property, receiver);
    // Re-bind methods so `this` is the real client, not the proxy.
    return typeof value === "function" ? value.bind(client) : value;
  },
});
