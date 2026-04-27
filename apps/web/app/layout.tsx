import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "my-miro",
  description: "Collaborative whiteboard app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
