import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

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
      className={`${inter.variable} ${jakarta.variable} h-full antialiased dark scroll-smooth bg-black text-white overflow-x-hidden w-full max-w-full font-sans`}
    >
      <head>
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
      </head>
      <body className={`${inter.className} min-h-full flex flex-col overflow-x-hidden w-full max-w-full font-sans`}>{children}</body>
    </html>
  );
}
