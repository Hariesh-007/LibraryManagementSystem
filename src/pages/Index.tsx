import LibraryNavbar from "@/components/LibraryNavbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LibraryFooter from "@/components/LibraryFooter";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

// Inline Book type
 type Book = {
   id: string;
   title: string;
   author?: string;
   description?: string;
   isbn?: string;
   category?: string;
   cover_url?: string;
   available_copies?: number;
 };

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [recommended, setRecommended] = useState<Book[]>([]);
  const [checkingRole, setCheckingRole] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndRecommendations = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setUser(null);
        setIsStudent(false);
        setRecommended([]);
        setCheckingRole(false);
        return;
      }
      setUser(authData.user);
      // Check if staff
      const { data: staff } = await supabase
        .from('staff')
        .select('id')
        .eq('email', authData.user.email)
        .single();
      if (staff) {
        navigate('/StaffLanding');
        return;
      }
      // Check if student
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('email', authData.user.email)
        .single();
      if (student) {
        setIsStudent(true);
        // Fetch borrowed books
        const { data: borrowedRes } = await supabase
          .from('borrow_records')
          .select('id, book:books(id, category)')
          .eq('user_id', authData.user.id);
        const borrowedBookIds = (borrowedRes || []).map((r: any) => r.book?.id).filter(Boolean);
        const categories = Array.from(new Set((borrowedRes || []).map((r: any) => r.book?.category).filter(Boolean)));
        if (categories.length > 0) {
          const { data: recBooks } = await supabase
            .from('books')
            .select('*')
            .in('category', categories)
            .not('id', 'in', borrowedBookIds.length > 0 ? borrowedBookIds : [''])
            .limit(10);
          setRecommended(recBooks || []);
        } else {
          setRecommended([]);
        }
      } else {
        setIsStudent(false);
        setRecommended([]);
      }
      setCheckingRole(false);
    };
    fetchUserAndRecommendations();
  }, [navigate]);

  if (checkingRole) {
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

  return (
    <div className="min-h-screen bg-background">
      <LibraryNavbar />
      <HeroSection />
      {/* Recommended for You Section (students only) */}
      {user && isStudent && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-accent">Recommended for You</h2>
            {recommended.length === 0 ? (
              <div className="text-muted-foreground">No recommendations yet. Borrow books to get personalized suggestions!</div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {recommended.map(book => (
                  <div key={book.id} className="min-w-[220px] bg-muted rounded-xl shadow p-4 flex flex-col items-center">
                    <img
                      src={book.cover_url || '/placeholder.svg'}
                      alt={book.title}
                      className="w-20 h-32 object-cover rounded mb-2 shadow"
                    />
                    <div className="font-semibold text-center mb-1">{book.title}</div>
                    <div className="text-sm text-muted-foreground text-center mb-1">{book.author}</div>
                    <div className="text-xs text-muted-foreground text-center">{book.category}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <FeaturesSection />
      <LibraryFooter />
    </div>
  );
};

export default Index;
