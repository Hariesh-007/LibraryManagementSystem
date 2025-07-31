import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LibraryNavbar from "@/components/LibraryNavbar";
import LibraryFooter from "@/components/LibraryFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BookOpen, Settings, ToggleLeft, ToggleRight } from "lucide-react";

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
  const [selectedRole, setSelectedRole] = useState<'student' | 'staff'>('student');
  const navigate = useNavigate();

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

  const handleDashboardAccess = () => {
    if (selectedRole === 'student') {
      navigate('/student');
    } else {
      navigate('/staff');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-purple-50">
      <LibraryNavbar />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <HeroSection />
          
          {/* Role Toggle Section */}
          <section className="py-16 bg-gradient-to-r from-red-600 to-purple-700">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Dashboard Access
                </h2>
                <p className="text-red-100 text-lg mb-8">
                  Toggle between Student and Staff dashboards
                </p>
                
                {/* Single Toggle Button */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-full p-2">
                    <span className={`text-sm font-medium transition-colors ${
                      selectedRole === 'student' ? 'text-white' : 'text-white/60'
                    }`}>
                      Student
                    </span>
                    
                    <Button
                      onClick={() => setSelectedRole(selectedRole === 'student' ? 'staff' : 'student')}
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-white/20 rounded-full"
                    >
                      {selectedRole === 'student' ? (
                        <ToggleLeft className="h-8 w-8 text-white" />
                      ) : (
                        <ToggleRight className="h-8 w-8 text-white" />
                      )}
                    </Button>
                    
                    <span className={`text-sm font-medium transition-colors ${
                      selectedRole === 'staff' ? 'text-white' : 'text-white/60'
                    }`}>
                      Staff
                    </span>
                  </div>

                  {/* Dynamic Role Display */}
                  <Card className="bg-white/95 backdrop-blur-sm max-w-md w-full">
                    <CardHeader className="text-center pb-3">
                      <div className="mx-auto mb-3">
                        {selectedRole === 'student' ? (
                          <Users className="h-12 w-12 text-red-600" />
                        ) : (
                          <UserCheck className="h-12 w-12 text-purple-600" />
                        )}
                      </div>
                      <CardTitle className={`text-xl ${
                        selectedRole === 'student' ? 'text-red-600' : 'text-purple-600'
                      }`}>
                        {selectedRole === 'student' ? 'Student Dashboard' : 'Staff Dashboard'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 mb-4">
                        {selectedRole === 'student' 
                          ? 'Access your personal library account, borrowed books, reading goals, and recommendations.'
                          : 'Manage library operations, oversee borrow requests, and access administrative features.'
                        }
                      </p>
                      
                      <Button
                        onClick={handleDashboardAccess}
                        className={`w-full ${
                          selectedRole === 'student'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Access {selectedRole === 'student' ? 'Student' : 'Staff'} Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
          
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
