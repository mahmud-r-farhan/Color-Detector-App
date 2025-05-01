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
    url: "https://devplus.fun",
    siteName: "Color Detector",
    images: [
      {
        url: "./banner.jpg.png",
        width: 512,
        height: 512,
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
    creator: "@Mahmudur Rahman",
    images: ["./banner.jpg"],
  },
  icons: {
    icon: "./icons.png",
    apple: "./icons.png",
  },
  themeColor: "#ffffff",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
