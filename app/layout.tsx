import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import GTMPageView  from "./_components/GTMPageView/index";
import type { Metadata } from "next";
import Footer from "./_components/Footer/index";
import Header from "./_components/Header/index";
import { Suspense } from "react";

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
        <GoogleTagManager gtmId="GTM-CGCGBXT298" />
        <Suspense fallback={null}>
          <GTMPageView />
        </Suspense>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
