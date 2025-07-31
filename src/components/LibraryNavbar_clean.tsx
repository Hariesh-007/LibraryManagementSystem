import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Menu, X } from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const LibraryNavbar = () => {
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const navigate = useNavigate();

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

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-primary">KL SmartLibrary</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
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

            {/* Demo User Badge */}
            <div className="flex items-center space-x-2 ml-4">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Demo Mode
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
                    handleNav('/');
                    setIsMenuOpen(false);
                  }}
                >
                  Home
                </Button>
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
                
                {/* Demo Mode Badge */}
                <div className="px-3 py-2">
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium inline-block">
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
