import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MA360 SamaritanLink — Care That Crosses the Distance",
  description:
    "A connected digital-health extension platform linking people to health navigation, screening, clinical care, diagnostics, medicines, referrals and continuous follow-up. A service of MedAccess360 Foundation.",
  metadataBase: new URL("https://medaccess360.com"),
  icons: { icon: "/ma360-logo.svg" },
  openGraph: {
    title: "MA360 SamaritanLink — Care That Crosses the Distance",
    description:
      "The connected digital-health service of MedAccess360 Foundation — health navigation, screening, clinical care, diagnostics, medicines, referrals and follow-up.",
    siteName: "MedAccess360 Foundation",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#158084",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
