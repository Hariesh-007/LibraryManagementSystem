import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Menu, X, Users, UserCheck, ToggleLeft, ToggleRight } from "lucide-react";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const LibraryNavbar = () => {
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const [dashboardMode, setDashboardMode] = useState<'student' | 'staff'>('student');
  const navigate = useNavigate();
  const location = useLocation();

  // Update dashboard mode based on current route
  useEffect(() => {
    if (location.pathname === '/staff' || location.pathname === '/StaffLanding') {
      setDashboardMode('staff');
    } else if (location.pathname === '/student' || location.pathname === '/account') {
      setDashboardMode('student');
    }
  }, [location.pathname]);

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

  const toggleDashboard = () => {
    const newMode = dashboardMode === 'student' ? 'staff' : 'student';
    setDashboardMode(newMode);
    navigate(newMode === 'student' ? '/student' : '/staff');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/student" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-primary">KL SmartLibrary</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/catalog" className="text-foreground hover:text-primary transition-colors">
              Catalog
            </Link>
            <Link to="/digital-resources" className="text-foreground hover:text-primary transition-colors">
              Digital Resources
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search books, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-64"
              />
              <Button
                size="sm"
                onClick={handleSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Demo User Badge and Dashboard Toggle */}
            <div className="flex items-center space-x-2 ml-4">
              <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Demo Mode
              </div>
              
              {/* Single Dashboard Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1">
                <span className={`text-xs font-medium px-2 transition-colors ${
                  dashboardMode === 'student' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  Student
                </span>
                
                <Button
                  onClick={toggleDashboard}
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  {dashboardMode === 'student' ? (
                    <ToggleLeft className="h-4 w-4 text-red-600" />
                  ) : (
                    <ToggleRight className="h-4 w-4 text-purple-600" />
                  )}
                </Button>
                
                <span className={`text-xs font-medium px-2 transition-colors ${
                  dashboardMode === 'staff' ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  Staff
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search books, authors..."
                  value={mobileSearchTerm}
                  onChange={(e) => setMobileSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleMobileSearch()}
                />
                <Button
                  size="sm"
                  onClick={handleMobileSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-2">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    handleNav('/catalog');
                    setIsMenuOpen(false);
                  }}
                >
                  Catalog
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    handleNav('/digital-resources');
                    setIsMenuOpen(false);
                  }}
                >
                  Digital Resources
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    handleNav('/about');
                    setIsMenuOpen(false);
                  }}
                >
                  About
                </Button>
                
                {/* Mobile Dashboard Toggle */}
                <div className="border-t pt-2 mt-2">
                  <p className="text-sm text-gray-600 mb-3 px-3">Dashboard Mode:</p>
                  <div className="px-3">
                    <div className="flex items-center justify-between bg-gray-100 rounded-full p-2">
                      <span className={`text-sm font-medium transition-colors ${
                        dashboardMode === 'student' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        Student
                      </span>
                      
                      <Button
                        onClick={toggleDashboard}
                        variant="ghost"
                        size="sm"
                        className="p-2 hover:bg-gray-200 rounded-full"
                      >
                        {dashboardMode === 'student' ? (
                          <ToggleLeft className="h-6 w-6 text-red-600" />
                        ) : (
                          <ToggleRight className="h-6 w-6 text-purple-600" />
                        )}
                      </Button>
                      
                      <span className={`text-sm font-medium transition-colors ${
                        dashboardMode === 'staff' ? 'text-purple-600' : 'text-gray-500'
                      }`}>
                        Staff
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Demo Mode Badge */}
                <div className="px-3 py-2">
                  <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium inline-block">
                    Demo Mode
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LibraryNavbar;
