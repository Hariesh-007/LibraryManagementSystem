import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LibraryNavbar from "@/components/LibraryNavbar";
import StaffHeroSection from "@/components/StaffHeroSection";
import StaffFeaturesSection from "@/components/StaffFeaturesSection";
import LibraryFooter from "@/components/LibraryFooter";
import { supabase } from "@/lib/supabaseClient";

const StaffLanding = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  useEffect(() => {
    const checkStaff = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setChecked(true);
        setIsStaff(false);
        navigate("/");
        return;
      }
      const { data: staff } = await supabase
        .from("staff")
        .select("id")
        .eq("email", authData.user.email)
        .single();
      if (!staff) {
        setChecked(true);
        setIsStaff(false);
        navigate("/");
      } else {
        setChecked(true);
        setIsStaff(true);
      }
    };
    checkStaff();
  }, [navigate]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <div className="text-lg text-muted-foreground">Verifying your account, please wait...</div>
        </div>
      </div>
    );
  }

  if (!isStaff) return null;

  return (
    <div className="min-h-screen bg-background">
      <LibraryNavbar />
      <StaffHeroSection />
      <StaffFeaturesSection />
      <LibraryFooter />
    </div>
  );
};

export default StaffLanding; 