import LibraryNavbar from "@/components/LibraryNavbar";
import StaffHeroSection from "@/components/StaffHeroSection";
import StaffFeaturesSection from "@/components/StaffFeaturesSection";
import LibraryFooter from "@/components/LibraryFooter";

const StaffLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <LibraryNavbar />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <StaffHeroSection />
          <StaffFeaturesSection />
        </main>
        <LibraryFooter />
      </div>
    </div>
  );
};

export default StaffLanding;
