"use client";

/** Last-resort boundary: catches failures in the root layout itself, where
 * error.tsx cannot render because there is no layout to render into. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <h1 style={{ fontSize: "1.25rem", margin: 0 }}>Service unavailable</h1>
          <p style={{ color: "#555", fontSize: "0.875rem", lineHeight: 1.6 }}>
            The application could not start rendering this page. This usually
            means the database is unreachable.
          </p>
          {error.digest ? (
            <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#666" }}>
              Error reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1rem",
              background: "#000",
              color: "#fff",
              border: 0,
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
