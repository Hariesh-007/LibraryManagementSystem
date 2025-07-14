import LibraryNavbar from "@/components/LibraryNavbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LibraryFooter from "@/components/LibraryFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LibraryNavbar />
      <HeroSection />
      <FeaturesSection />
      <LibraryFooter />
    </div>
  );
};

export default Index;
