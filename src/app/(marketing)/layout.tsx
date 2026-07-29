import { BrandHeader } from "@/components/ui/brand-header";
import { Footer } from "@/components/ui/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BrandHeader />
      <div className="flex-grow pt-16">{children}</div>
      <Footer />
    </>
  );
}
