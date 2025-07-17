import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { BookOpen, Mail, Phone, MapPin, Users, CalendarCheck } from 'lucide-react';

const team = [
  { name: 'Dr. S. Ramesh', role: 'Chief Librarian', img: '/placeholder.svg' },
  { name: 'Ms. Priya Sharma', role: 'Digital Resources Lead', img: '/placeholder.svg' },
  { name: 'Mr. Anil Kumar', role: 'Student Services', img: '/placeholder.svg' },
];

const highlights = [
  { year: 2010, event: 'Library Automation Launched' },
  { year: 2015, event: 'Digital Resources Portal Introduced' },
  { year: 2020, event: '24/7 SmartLibrary Access' },
  { year: 2024, event: 'AI-Powered Book Recommendations' },
];

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
          <img src="/src/assets/library-hero.jpg" alt="KL University Library" className="rounded-xl shadow mb-6 w-full object-cover h-48" />
          <p className="text-lg mb-6 text-muted-foreground">
            KL SmartLibrary is dedicated to empowering the academic community of KL University with intelligent library management, innovative learning resources, and 24/7 digital access. Our mission is to foster research, learning, and collaboration through state-of-the-art technology and a comprehensive collection of books, journals, and digital resources.
          </p>
          <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
          <p className="mb-6 text-muted-foreground">
            To provide seamless access to knowledge, support academic excellence, and inspire lifelong learning through smart, user-centric library services.
          </p>

          {/* Timeline Section */}
          <h2 className="text-xl font-semibold mb-2 flex items-center"><CalendarCheck className="h-6 w-6 mr-2 text-accent" /> Library Highlights</h2>
          <ul className="mb-8 border-l-2 border-accent/30 pl-6">
            {highlights.map(h => (
              <li key={h.year} className="mb-3 relative">
                <span className="absolute -left-3 top-1.5 w-3 h-3 bg-accent rounded-full border-2 border-background"></span>
                <span className="font-semibold text-accent mr-2">{h.year}</span>
                <span className="text-muted-foreground">{h.event}</span>
              </li>
            ))}
          </ul>

          {/* Team Section */}
          <h2 className="text-xl font-semibold mb-2 flex items-center"><Users className="h-6 w-6 mr-2 text-accent" /> Meet Our Team</h2>
          <div className="flex gap-6 mb-8 flex-wrap">
            {team.map(member => (
              <div key={member.name} className="flex flex-col items-center bg-muted rounded-xl shadow p-4 w-40">
                <img src={member.img} alt={member.name} className="w-16 h-16 rounded-full mb-2 border-2 border-accent object-cover" />
                <div className="font-semibold text-primary text-center">{member.name}</div>
                <div className="text-xs text-muted-foreground text-center">{member.role}</div>
              </div>
            ))}
          </div>

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