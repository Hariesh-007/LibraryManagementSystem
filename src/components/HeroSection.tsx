import { Button } from "@/components/ui/button";
import { Search, BookOpen, Users, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/library-hero.jpg";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-hero min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-hero/85"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Smart Library
            <span className="block text-accent">Management</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Discover, learn, and manage your academic resources with our intelligent library platform
          </p>

          {/* Hero Search Bar */}
          <div className="mb-12 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search for books, authors, research papers..." 
                className="pl-12 pr-4 py-4 text-lg bg-background/95 backdrop-blur border-0 shadow-book focus:shadow-glow transition-bounce"
              />
              <Button 
                variant="accent" 
                size="lg" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Catalog
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-background/10 backdrop-blur border-primary-foreground/30 text-primary-foreground hover:bg-background/20">
              Digital Resources
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-background/10 backdrop-blur rounded-lg p-6 shadow-card hover:shadow-glow transition-bounce">
                <BookOpen className="h-8 w-8 text-accent mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary-foreground">50,000+</div>
                <div className="text-primary-foreground/80">Books Available</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-background/10 backdrop-blur rounded-lg p-6 shadow-card hover:shadow-glow transition-bounce">
                <Users className="h-8 w-8 text-accent mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary-foreground">25,000+</div>
                <div className="text-primary-foreground/80">Active Users</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-background/10 backdrop-blur rounded-lg p-6 shadow-card hover:shadow-glow transition-bounce">
                <Zap className="h-8 w-8 text-accent mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary-foreground">AI-Powered</div>
                <div className="text-primary-foreground/80">Smart Search</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Book Cards Animation */}
      <div className="absolute top-20 left-10 opacity-20 animate-pulse">
        <div className="bg-background/20 backdrop-blur rounded-lg p-4 shadow-book">
          <BookOpen className="h-6 w-6 text-accent" />
        </div>
      </div>
      <div className="absolute bottom-32 right-16 opacity-20 animate-pulse delay-1000">
        <div className="bg-background/20 backdrop-blur rounded-lg p-4 shadow-book">
          <BookOpen className="h-6 w-6 text-accent" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;