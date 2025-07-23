import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  BookOpen, 
  Smartphone, 
  BarChart3, 
  Bell, 
  Shield,
  Zap,
  Users,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabaseClient';

const FeaturesSection = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const features = [
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Intelligent Search",
      description: "AI-powered search that understands context and finds exactly what you need across our entire collection.",
      highlight: "Smart Discovery"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Digital Catalog",
      description: "Browse our comprehensive collection of books, journals, and digital resources with advanced filtering.",
      highlight: "50K+ Resources"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: "Mobile Access",
      description: "Access your library account, search books, and manage reservations from anywhere on any device.",
      highlight: "Always Available"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Analytics Dashboard",
      description: "Track your reading habits, discover trends, and get personalized recommendations based on your interests.",
      highlight: "Personal Insights"
    },
    {
      icon: <Bell className="h-8 w-8 text-primary" />,
      title: "Smart Notifications",
      description: "Automated reminders for due dates, new arrivals, and available reservations via email and SMS.",
      highlight: "Never Miss a Date"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure Platform",
      description: "Enterprise-grade security protecting your personal data with encrypted communications and secure access.",
      highlight: "Bank-Level Security"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "RFID Integration",
      description: "Lightning-fast check-in and check-out with RFID technology and automated self-service kiosks.",
      highlight: "Instant Processing"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Community Features",
      description: "Connect with fellow readers, join book clubs, and participate in academic discussions.",
      highlight: "Social Learning"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "24/7 Digital Access",
      description: "Access digital resources, e-books, and research databases anytime, anywhere with your library account.",
      highlight: "Always Open"
    }
  ];

  const handleGetStarted = useCallback(() => {
    // Replace with router navigation if available
    window.location.href = "/get-started";
  }, []);

  const handleScheduleDemo = useCallback(() => {
    // Replace with router navigation if available
    window.location.href = "/schedule-demo";
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setIsLoggedIn(!!data.user);
    };
    checkUser();
  }, []);

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Powerful Features for Modern Learning
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience the future of library management with our comprehensive suite of smart tools and services designed for academic excellence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-book transition-bounce cursor-pointer border-border/50 bg-gradient-card"
            >
              <CardHeader className="text-center pb-4">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
                    {feature.icon}
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">
                    {feature.highlight}
                  </span>
                </div>
                <CardTitle className="text-xl text-primary group-hover:text-primary-glow transition-smooth">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-card rounded-2xl p-8 md:p-12 shadow-book">
            <h3 className="text-3xl font-bold text-primary mb-4">
              Ready to Transform Your Library Experience?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students and faculty who are already using our smart library platform to enhance their learning journey.
            </p>
            {!isLoggedIn && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" className="text-lg px-8 py-4" onClick={handleGetStarted}>
                  Get Started Today
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={handleScheduleDemo}>
                  Schedule Demo
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;