import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medicare Hospital, Irinjalakuda",
  description:
    "Book appointments, manage your health records, and connect with Medicare Hospital, Irinjalakuda, Kerala.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
