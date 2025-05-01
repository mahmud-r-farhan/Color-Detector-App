import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// SEO & social sharing metadata
export const metadata = {
  title: "Color Detector App – Real-Time Camera Color Picker",
  description:
    "Detect and identify colors using your device camera. Get color names and hex codes instantly. Install the PWA for offline use.",
  metadataBase: new URL("https://devplus.fun"),
  openGraph: {
    title: "Color Detector App",
    description:
      "Use your camera to detect colors in real time. Get color names, hex values, and more.",
    url: "https://color-detector-app.vercel.app/",
    siteName: "Color Detector",
    images: [
      {
        url: "\banner.jpg",
        width: 1200,
        height: 630,
        alt: "Color Detector Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Detector App",
    description:
      "Camera-based real-time color detection app with PWA support.",
    creator: "@devplus",
    images: ["/banner.jpg"],
  },
  icons: {
    icon: "/icons.png",
    apple: "/icons.png",
  },
  themeColor: "#000000",
  appleWebApp: {
    title: "Color Detector",
    statusBarStyle: "black-translucent",
    capable: true,
    startupImage: ["/splash.png"]
  },
  manifest: "/manifest.json", 
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}