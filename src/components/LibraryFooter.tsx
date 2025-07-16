import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Clock
} from "lucide-react";

const LibraryFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand & Description */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <BookOpen className="h-8 w-8 text-accent" />
                <span className="text-2xl font-bold">KL SmartLibrary</span>
              </div>
              <p className="text-primary-foreground/80 mb-6 leading-relaxed">
                Empowering KL University's academic community through intelligent library management and innovative learning resources.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-accent hover:bg-primary-foreground/10">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-accent">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="/catalog" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/catalog'; }}>Browse Catalog</a></li>
                <li><a href="/digital-resources" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/digital-resources'; }}>Digital Resources</a></li>
                <li><a href="/research-databases" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/research-databases'; }}>Research Databases</a></li>
                <li><a href="/study-rooms" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/study-rooms'; }}>Study Rooms</a></li>
                <li><a href="/events" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/events'; }}>Events & Workshops</a></li>
                <li><a href="/help" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/help'; }}>Help & Support</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-accent">Services</h3>
              <ul className="space-y-3">
                <li><a href="/catalog" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/catalog'; }}>Book Borrowing</a></li>
                <li><a href="/downloads" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/downloads'; }}>Digital Downloads</a></li>
                <li><a href="/research-assistance" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/research-assistance'; }}>Research Assistance</a></li>
                <li><a href="/interlibrary-loans" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/interlibrary-loans'; }}>Interlibrary Loans</a></li>
                <li><a href="/citation-help" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/citation-help'; }}>Citation Help</a></li>
                <li><a href="/academic-support" className="text-primary-foreground/80 hover:text-accent transition-smooth" onClick={e => { e.preventDefault(); window.location.href = '/academic-support'; }}>Academic Support</a></li>
              </ul>
            </div>

            {/* Contact & Hours */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-accent">Contact & Hours</h3>
              <div className="space-y-4 text-primary-foreground/80">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>KL University Campus<br />Green Fields, Vaddeswaram<br />Guntur, Andhra Pradesh 522302</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-accent" />
                  <span>+91 863 2344 700</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-accent" />
                  <span>library@kluniversity.in</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <div>Mon-Fri: 7:00 AM - 11:00 PM</div>
                    <div>Sat-Sun: 9:00 AM - 9:00 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-primary-foreground/20" />

        {/* Newsletter Signup */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-accent">Stay Updated</h3>
              <p className="text-primary-foreground/80">Get the latest news about new arrivals, events, and library services.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input 
                placeholder="Enter your email" 
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-accent"
              />
              <Button variant="accent" className="sm:w-auto">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-primary-foreground/20" />

        {/* Bottom Footer */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <div>
              © 2024 KL University Smart Library Management System. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-accent transition-smooth">Privacy Policy</a>
              <a href="#" className="hover:text-accent transition-smooth">Terms of Service</a>
              <a href="#" className="hover:text-accent transition-smooth">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LibraryFooter;