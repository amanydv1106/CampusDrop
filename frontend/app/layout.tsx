import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusDrop | Transfer Files Cross-Platform",
  description: "A CampusDrop frontend for local and public-room file sharing."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4285f4",
  colorScheme: "dark light"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
