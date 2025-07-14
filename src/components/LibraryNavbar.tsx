import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, User, Menu, X } from "lucide-react";

const LibraryNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">KL SmartLibrary</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-primary transition-smooth">Catalog</a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth">Digital Resources</a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth">My Account</a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth">About</a>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search books, authors, topics..." 
                className="pl-10 bg-muted/50 border-muted-foreground/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="hero" size="sm" className="bg-gradient-secondary text-secondary-foreground hover:shadow-secondary">
              Join KL Library
            </Button>
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
                />
              </div>
              
              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-2">
                <a href="#" className="px-2 py-2 text-foreground hover:text-primary transition-smooth">Catalog</a>
                <a href="#" className="px-2 py-2 text-foreground hover:text-primary transition-smooth">Digital Resources</a>
                <a href="#" className="px-2 py-2 text-foreground hover:text-primary transition-smooth">My Account</a>
                <a href="#" className="px-2 py-2 text-foreground hover:text-primary transition-smooth">About</a>
              </div>
              
              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="ghost" className="justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button variant="hero" className="justify-start">
                  Join Library
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LibraryNavbar;