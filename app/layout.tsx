import "./globals.css";
import Footer from "./_components/Footer/index";
import Header from "./_components/Header/index";

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
    </html>
  );
}
