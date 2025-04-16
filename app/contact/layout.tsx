import Hero from "../_components/Hero/index";
import Sheet from "../_components/Sheet/index";

export const metadata = {
  title: "Knowledge S",
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <>
      <Hero title="Contact" sub="お問い合わせ" />
      <Sheet>{children}</Sheet>
    </>
  );
}