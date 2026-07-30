import { lookup } from "node:dns/promises";
import net from "node:net";

/**
 * Low-level reachability probe for the configured database host.
 *
 * Prisma flattens every transport failure into the same message — "Can't reach
 * database server at <host>" with code P2010 — so a wrong hostname and a dead
 * port are indistinguishable from the ORM error. Those need completely
 * different fixes, so resolve the name and open a socket ourselves.
 */
export type NetworkProbe =
  | { reachable: true }
  | { reachable: false; kind: "dns" | "refused" | "timeout" | "unknown"; detail?: string };

export function parseDatabaseHost(
  connectionString: string | undefined,
): { host: string; port: number } | null {
  if (!connectionString) return null;
  try {
    const url = new URL(connectionString);
    return { host: url.hostname, port: Number(url.port || 5432) };
  } catch {
    return null;
  }
}

/**
 * Which account and database a rejected connection was attempting.
 *
 * "The database rejected the credentials" names the symptom and leaves three
 * candidates — wrong user, wrong password, wrong database — indistinguishable.
 * Two services pointed at one database, one connecting and one not, is settled
 * in seconds by comparing these; without them it is guesswork across a
 * dashboard nobody can read from the outside.
 *
 * The password is never included. It is the one part of the string that is
 * genuinely secret, and it is not needed to spot the mismatch.
 */
export function parseDatabaseIdentity(
  connectionString: string | undefined,
): { user: string | null; database: string | null } | null {
  if (!connectionString) return null;
  try {
    const url = new URL(connectionString);
    const database = url.pathname.replace(/^\//, "");
    return {
      user: decodeURIComponent(url.username) || null,
      database: database ? decodeURIComponent(database) : null,
    };
  } catch {
    return null;
  }
}

export async function probeDatabaseSocket(
  host: string,
  port: number,
  timeoutMs = 4000,
): Promise<NetworkProbe> {
  try {
    await lookup(host);
  } catch (error) {
    return {
      reachable: false,
      kind: "dns",
      detail: (error as { code?: string }).code ?? "ENOTFOUND",
    };
  }

  return new Promise<NetworkProbe>((resolve) => {
    const socket = net.connect({ host, port });
    let settled = false;

    const finish = (result: NetworkProbe) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish({ reachable: true }));
    socket.once("timeout", () => finish({ reachable: false, kind: "timeout" }));
    socket.once("error", (error: NodeJS.ErrnoException) => {
      finish({
        reachable: false,
        kind: error.code === "ECONNREFUSED" ? "refused" : "unknown",
        detail: error.code,
      });
    });
  });
}
