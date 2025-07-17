import LibraryNavbar from "@/components/LibraryNavbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LibraryFooter from "@/components/LibraryFooter";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StaffLanding from './StaffLanding';

const Index = () => {
  const [role, setRole] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        // Check staff table
        const { data: staff } = await supabase
          .from('staff')
          .select('id')
          .eq('email', data.user.email)
          .single();
        if (staff) {
          setRole('staff');
        } else {
          setRole('student');
        }
      }
      setChecked(true);
    };
    checkRole();
  }, []);

  if (!checked) return null; // or a loading spinner

  if (role === 'staff') {
    return <StaffLanding />;
  }

  // Default: general landing page
  return (
    <>
      <LibraryNavbar />
      <HeroSection />
      <FeaturesSection />
      <LibraryFooter />
    </>
  );
};

export default Index;
