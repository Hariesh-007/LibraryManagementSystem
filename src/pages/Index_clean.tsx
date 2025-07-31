import { useEffect, useState } from 'react';
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LibraryNavbar from "@/components/LibraryNavbar";
import LibraryFooter from "@/components/LibraryFooter";

type Book = {
  id: string;
  title: string;
  author?: string;
  category?: string;
  description?: string;
  cover_url?: string;
};

const Index = () => {
  const [recommended, setRecommended] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Mock recommended books for demo
      setRecommended([
        {
          id: '1',
          title: 'Introduction to Algorithms',
          author: 'Thomas H. Cormen',
          category: 'Computer Science',
          description: 'A comprehensive introduction to the modern study of computer algorithms.',
          cover_url: '/placeholder.svg'
        },
        {
          id: '2',
          title: 'Clean Code',
          author: 'Robert C. Martin',
          category: 'Software Engineering',
          description: 'A handbook of agile software craftsmanship.',
          cover_url: '/placeholder.svg'
        },
        {
          id: '3',
          title: 'The Pragmatic Programmer',
          author: 'David Thomas',
          category: 'Software Engineering',
          description: 'Your journey to mastery in software development.',
          cover_url: '/placeholder.svg'
        }
      ]);
      setLoading(false);
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <LibraryNavbar />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <HeroSection />
          <FeaturesSection />
          
          {/* Recommended Books Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12 text-primary">
                Popular Books
              </h2>
              
              {loading ? (
                <div className="text-center">Loading recommendations...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recommended.map((book) => (
                    <div key={book.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <img 
                        src={book.cover_url || '/placeholder.svg'} 
                        alt={book.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-primary">{book.title}</h3>
                        <p className="text-muted-foreground mb-2">by {book.author}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-accent bg-accent/10 px-2 py-1 rounded">
                            {book.category}
                          </span>
                          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
        <LibraryFooter />
      </div>
    </div>
  );
};

export default Index;
