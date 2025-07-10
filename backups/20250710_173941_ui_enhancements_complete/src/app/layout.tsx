import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "../contexts/SettingsContext";

export const metadata: Metadata = {
  title: "Nishen's AI Workspace",
  description: "Advanced AI workspace powered by Claude Code AI - Professional development environment for system engineering and automation",
  keywords: "AI, Claude, Workspace, Development, Systems Engineering, Automation",
  authors: [{ name: "Nishen Harichunder", url: "mailto:nishen@mail.com" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased bg-black text-white min-h-screen"
      >
        <SettingsProvider>
          <div className="h-screen overflow-hidden">
            {children}
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
