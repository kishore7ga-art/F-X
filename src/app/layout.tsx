import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";

export const metadata: Metadata = {
  title: "XITE - College Website Builder & SaaS Platform",
  description: "Pick a template, edit content, publish your college website with XITE.",
  icons: {
    icon: "/xite-logo.png",
    shortcut: "/xite-logo.png",
    apple: "/xite-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="min-h-screen antialiased dark scroll-smooth bg-black text-white w-full max-w-full font-sans"
    >
      <head>
        {/* The full weight range each family actually ships, not a list of the
            six somebody needed at the time. Inter started at 300 and the other
            two at 500, so `font-light` and `font-thin` anywhere in the app had
            no font file and were either synthesised or silently rendered at the
            nearest weight. The ranges differ per family because they have to:
            Plus Jakarta Sans has nothing outside 200-800, and asking for more
            is an HTTP 400 for the whole stylesheet, all three families with it.
            Variable fonts, so a wider axis is the same file. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Plus+Jakarta+Sans:wght@200..800&family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-screen flex flex-col w-full max-w-full font-sans overflow-x-clip">
        <Script
          id="scroll-restoration"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              window.scrollTo(0, 0);
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
