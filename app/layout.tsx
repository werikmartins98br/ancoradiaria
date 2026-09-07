import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Âncora Diária — Um lugar para voltar",
  description: "437 devocionais em 42 jornadas, sem calendário, sem culpa e sem sequência para perder.",
  manifest: "/manifest.webmanifest",
  applicationName: "Âncora Diária",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
