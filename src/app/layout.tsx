
import WhatsAppAccessButton from "@/components/WhatsAppAccessButton";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Infant Jesus Academy | Jos, Plateau State",
    template: "%s | Infant Jesus Academy",
  },
  description:
    "Discover Infant Jesus Academy on Rukuba Road, Jos, Plateau State. Explore our learning approach and find out how to enquire about admission.",
  applicationName: "Infant Jesus Academy",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.infantjesusacademy.edu.ng"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children} <WhatsAppAccessButton /></body>
    </html>
  );
}
