import Hero from "@/app/_components/Hero";
import Sheet from "@/app/_components/Sheet";

type Props = {
    children: React.ReactNode;
};

export const revalidate = 60;

export default function NewsLayout({children}: Props){
    return (
        <>
            <Hero title="Knowledge" sub="知識" />
            <Sheet>{children}</Sheet>
        </>
    );
}