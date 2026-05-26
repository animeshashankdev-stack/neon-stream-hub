import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Senpai.tv — stream beyond",
    template: "%s · Senpai.tv",
  },
  description: "Senpai.tv is a premium streaming + reading platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#07060a] text-[#f6f1ff]">
        {children}
      </body>
    </html>
  );
}

