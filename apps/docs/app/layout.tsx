import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: {
    default: "ListeningKit Docs",
    template: "%s · ListeningKit Docs",
  },
  description: "Live social listening — pick platforms, install the extension, and watch customer signals cluster into insights.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}