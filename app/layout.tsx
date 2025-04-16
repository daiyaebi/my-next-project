import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import Footer from "./_components/Footer/index";
import Header from "./_components/Header/index";

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    template: '%s | Knowledge S',
    default: 'Knowledge S',
  },
  description:
    'Knowledge Sは即役に立つShopifyのナレッジ共有サイトです。',
  openGraph: {
    title: 'Knowledge S',
    description:
      'Knowledge Sは即役に立つShopifyのナレッジ共有サイトです。',
    images: ['/ogp.png'],
  },
  alternates: {
    canonical: 'http://localhost:3000',
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="js">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
      <GoogleAnalytics gaId="G-CGCGBXT2988" />
    </html>
  );
}
