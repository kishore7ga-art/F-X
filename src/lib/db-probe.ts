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
