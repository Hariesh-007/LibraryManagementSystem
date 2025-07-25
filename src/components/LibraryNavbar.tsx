import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, User, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const LibraryNavbar = () => {
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<'student' | 'staff' | null>(null);
  const [roleChecked, setRoleChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      let displayName = "";
      let foundRole: 'student' | 'staff' | null = null;
      if (data.user) {
        // Try to get name and role from students table
        const { data: student } = await supabase
          .from('students')
          .select('name')
          .eq('email', data.user.email)
          .single();
        if (student && student.name) {
          displayName = student.name;
          foundRole = 'student';
        } else {
          // Try staff table
          const { data: staff } = await supabase
            .from('staff')
            .select('name')
            .eq('email', data.user.email)
            .single();
          if (staff && staff.name) {
            displayName = staff.name;
            foundRole = 'staff';
          }
        }
        if (!displayName && data.user.user_metadata && data.user.user_metadata.full_name) {
          displayName = data.user.user_metadata.full_name;
        }
      }
      setUserName(displayName);
      setRole(foundRole);
      setRoleChecked(true);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    } else {
      toast({
        title: "Search Required",
        description: "Please enter a search term.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleMobileSearch = () => {
    if (mobileSearchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(mobileSearchTerm)}`);
    } else {
      toast({
        title: "Search Required",
        description: "Please enter a search term.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleNav = (path: string) => {
    navigate(path);
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleJoin = () => {
    navigate('/join');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserName("");
    localStorage.removeItem('user_name');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <Link
              to="/"
              className="cursor-pointer font-bold text-2xl text-primary"
            >
              KL SmartLibrary
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {roleChecked && role !== 'staff' && (
              <Link to="/catalog" className="text-foreground hover:text-primary transition-smooth">Catalog</Link>
            )}
            {roleChecked && (
              <Link to="/digital-resources" className="text-foreground hover:text-primary transition-smooth">Digital Resources</Link>
            )}
            {roleChecked && (
              <Link to="/account" className="text-foreground hover:text-primary transition-smooth">My Account</Link>
            )}
            {roleChecked && (
              <Link to="/about" className="text-foreground hover:text-primary transition-smooth">About</Link>
            )}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search books, authors, topics..." 
                className="pl-10 bg-muted/50 border-muted-foreground/20 focus:border-primary"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>
            <Button variant="accent" size="sm" onClick={handleSearch}>Search</Button>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {roleChecked && user ? (
              <>
                <span 
                  className="font-semibold text-primary bg-muted px-3 py-1 rounded-full mr-2 cursor-pointer hover:bg-muted/80 transition-colors" 
                  onClick={() => navigate('/account')}
                >
                  {userName || "User"}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : roleChecked && (
              <>
                <Button variant="ghost" size="sm" onClick={handleSignIn}>
                  Sign In
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search books..." 
                  className="pl-10 bg-muted/50"
                  value={mobileSearchTerm}
                  onChange={e => setMobileSearchTerm(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleMobileSearch(); }}
                />
                <Button variant="accent" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2" onClick={handleMobileSearch}>Search</Button>
              </div>
              
              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-2">
                {roleChecked && role !== 'staff' && (
                  <Link to="/catalog" className="px-2 py-2 text-foreground hover:text-primary transition-smooth">Catalog</Link>
                )}
                {roleChecked && (
                  <Link to="/digital-resources" className="px-2 py-2 text-foreground hover:text-primary transition-smooth">Digital Resources</Link>
                )}
                {roleChecked && (
                  <Link to="/account" className="px-2 py-2 text-foreground hover:text-primary transition-smooth">My Account</Link>
                )}
                {roleChecked && (
                  <Link to="/about" className="px-2 py-2 text-foreground hover:text-primary transition-smooth">About</Link>
                )}
              </div>
              
              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-2 pt-2">
                {roleChecked && user ? (
                  <>
                    <span 
                      className="font-semibold text-primary bg-muted px-3 py-1 rounded-full mb-1 cursor-pointer hover:bg-muted/80 transition-colors" 
                      onClick={() => navigate('/account')}
                    >
                      {userName || "User"}
                    </span>
                    <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : roleChecked && (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={handleSignIn}>
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LibraryNavbar;