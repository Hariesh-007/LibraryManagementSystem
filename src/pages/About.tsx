import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LibraryNavbar />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-card p-8">
          <div className="flex items-center mb-6">
            <BookOpen className="h-10 w-10 text-accent mr-3" />
            <h1 className="text-3xl font-bold">About KL SmartLibrary</h1>
          </div>
          <p className="text-lg mb-6 text-muted-foreground">
            KL SmartLibrary is dedicated to empowering the academic community of KL University with intelligent library management, innovative learning resources, and 24/7 digital access. Our mission is to foster research, learning, and collaboration through state-of-the-art technology and a comprehensive collection of books, journals, and digital resources.
          </p>
          <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
          <p className="mb-6 text-muted-foreground">
            To provide seamless access to knowledge, support academic excellence, and inspire lifelong learning through smart, user-centric library services.
          </p>
          <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
          <ul className="mb-4">
            <li className="flex items-center mb-2"><Mail className="h-5 w-5 mr-2 text-accent" /> library@kluniversity.in</li>
            <li className="flex items-center mb-2"><Phone className="h-5 w-5 mr-2 text-accent" /> +91 12345 67890</li>
            <li className="flex items-center"><MapPin className="h-5 w-5 mr-2 text-accent" /> KL University, Vaddeswaram, Andhra Pradesh, India</li>
          </ul>
          <div className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} KL SmartLibrary. All rights reserved.</div>
        </div>
      </main>
      <LibraryFooter />
    </div>
  );
};

export default About; 