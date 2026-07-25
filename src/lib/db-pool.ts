import pg from "pg";

/**
 * Postgres connection pool, tuned to survive a managed cloud database.
 *
 * Shared by the running app (src/lib/db.ts) and the seed script, so both
 * behave identically against local Docker Postgres and a cloud provider.
 */

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "db", "postgres"]);

function hostOf(connectionString: string): string {
  try {
    return new URL(connectionString).hostname;
  } catch {
    return "";
  }
}

/**
 * Managed Postgres (Neon, Supabase, RDS, ...) requires TLS; a Postgres
 * container on the same Docker network does not. Decide from the URL rather
 * than making the caller remember.
 */
export function sslConfig(connectionString: string): pg.PoolConfig["ssl"] {
  if (/[?&]sslmode=disable/.test(connectionString)) return undefined;

  const explicitlyRequired = /[?&]sslmode=(require|verify-ca|verify-full)/.test(
    connectionString,
  );
  if (!explicitlyRequired && LOCAL_HOSTS.has(hostOf(connectionString))) {
    return undefined;
  }

  // Certificates are verified against the system CA store by default, which is
  // correct for every major managed provider. Only disable it for a provider
  // using a self-signed cert, and know that it removes MITM protection.
  return {
    rejectUnauthorized: process.env.DATABASE_SSL_NO_VERIFY !== "true",
  };
}

export function createPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: sslConfig(connectionString),

    // Cloud databases cap concurrent connections. One container with a modest
    // ceiling is far safer than an unbounded pool exhausting the limit.
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),

    // Return connections to the provider rather than holding them open.
    idleTimeoutMillis: 30_000,
    // Fail fast instead of hanging a request when the database is unreachable.
    connectionTimeoutMillis: 10_000,
    // Stops NAT gateways and load balancers silently dropping idle sockets.
    keepAlive: true,
  });

  // This listener is what keeps the app alive across network blips. `pg` emits
  // 'error' on idle clients when a managed provider recycles or drops a
  // connection; an unhandled 'error' event terminates the Node process. With it
  // handled, the pool discards the dead client and opens a new one on the next
  // query.
  pool.on("error", (error) => {
    console.error("[db] idle client error (pool will recover):", error.message);
  });

  return pool;
}
