import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Target, Heart, TrendingUp, Clock, DollarSign, Bell } from 'lucide-react';

type Book = {
  id: string;
  title: string;
  author?: string;
  description?: string;
  isbn?: string;
  category?: string;
  cover_url?: string;
  available_copies?: number;
};

const Account = () => {
  const [borrowed, setBorrowed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState<Book[]>([]);
  
  // Mock user data for demonstration
  const mockUser = {
    email: 'demo@student.klu.ac.in',
    first_name: 'Demo',
    last_name: 'Student',
    roll_number: '230008343'
  };
  
  // Reading stats
  const [readingStats, setReadingStats] = useState({
    totalBooksRead: 12,
    booksThisMonth: 3,
    favoriteGenre: 'Computer Science',
    averageRating: 4.2,
    readingStreak: 7,
    totalFines: 0
  });

  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [readingGoals, setReadingGoals] = useState({
    yearly_goal: 24,
    current_count: 12,
    monthly_goal: 2,
    monthly_current: 3
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Mock data for demonstration
      setBorrowed([
        {
          id: 1,
          book: { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen' },
          borrowed_at: '2024-01-15',
          due_at: '2024-02-15',
          status: 'borrowed'
        },
        {
          id: 2,
          book: { title: 'Clean Code', author: 'Robert C. Martin' },
          borrowed_at: '2024-01-20',
          due_at: '2024-02-20',
          status: 'borrowed'
        }
      ]);

      setRecommended([
        {
          id: '1',
          title: 'Design Patterns',
          author: 'Gang of Four',
          category: 'Computer Science',
          available_copies: 3
        },
        {
          id: '2',
          title: 'The Pragmatic Programmer',
          author: 'David Thomas',
          category: 'Software Engineering',
          available_copies: 2
        }
      ]);

      setWishlist([
        {
          id: '3',
          title: 'Artificial Intelligence: A Modern Approach',
          author: 'Stuart Russell',
          category: 'AI/ML',
          available_copies: 1
        }
      ]);

      setLoading(false);
    };

    fetchData();
  }, []);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'borrowed': return 'default';
      case 'overdue': return 'destructive';
      case 'returned': return 'secondary';
      default: return 'outline';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <LibraryNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-muted-foreground">Loading your account...</div>
        </div>
        <LibraryFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LibraryNavbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar className="w-24 h-24 border-4 border-white/20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-white/10 text-2xl font-bold">
                {mockUser.first_name.charAt(0)}{mockUser.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">
                Welcome, {mockUser.first_name} {mockUser.last_name}!
              </h1>
              <p className="text-xl opacity-90 mb-1">Student ID: {mockUser.roll_number}</p>
              <p className="text-lg opacity-80">{mockUser.email}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Reading Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Read</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readingStats.totalBooksRead}</div>
              <p className="text-xs text-muted-foreground">
                +{readingStats.booksThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reading Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readingStats.readingStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Genre</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{readingStats.favoriteGenre}</div>
              <p className="text-xs text-muted-foreground">
                Rating: {readingStats.averageRating}/5
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Fines</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${readingStats.totalFines}</div>
              <p className="text-xs text-muted-foreground">All cleared!</p>
            </CardContent>
          </Card>
        </div>

        {/* Reading Goals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Reading Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Yearly Goal</span>
                  <span className="text-sm text-muted-foreground">
                    {readingGoals.current_count}/{readingGoals.yearly_goal} books
                  </span>
                </div>
                <Progress 
                  value={(readingGoals.current_count / readingGoals.yearly_goal) * 100} 
                  className="mb-1"
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round((readingGoals.current_count / readingGoals.yearly_goal) * 100)}% complete
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Monthly Goal</span>
                  <span className="text-sm text-muted-foreground">
                    {readingGoals.monthly_current}/{readingGoals.monthly_goal} books
                  </span>
                </div>
                <Progress 
                  value={(readingGoals.monthly_current / readingGoals.monthly_goal) * 100} 
                  className="mb-1"
                />
                <p className="text-xs text-muted-foreground">
                  {readingGoals.monthly_current >= readingGoals.monthly_goal ? 'Goal achieved!' : 'Keep reading!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currently Borrowed Books */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Currently Borrowed Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            {borrowed.length === 0 ? (
              <p className="text-muted-foreground">No books currently borrowed</p>
            ) : (
              <div className="space-y-4">
                {borrowed.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{record.book.title}</h4>
                      <p className="text-sm text-muted-foreground">by {record.book.author}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm">
                          <Calendar className="inline w-4 h-4 mr-1" />
                          Due: {new Date(record.due_at).toLocaleDateString()}
                        </span>
                        <Badge variant={isOverdue(record.due_at) ? 'destructive' : getBadgeVariant(record.status)}>
                          {isOverdue(record.due_at) ? 'Overdue' : record.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Renew
                      </Button>
                      <Button variant="outline" size="sm">
                        Return
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Books */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommended.map((book) => (
                <div key={book.id} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-1">{book.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                  <Badge variant="outline" className="mb-2">{book.category}</Badge>
                  <p className="text-xs text-muted-foreground mb-3">
                    {book.available_copies} copies available
                  </p>
                  <Button size="sm" className="w-full">
                    Reserve Book
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wishlist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              My Wishlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((book) => (
                <div key={book.id} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-1">{book.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                  <Badge variant="outline" className="mb-2">{book.category}</Badge>
                  <p className="text-xs text-muted-foreground mb-3">
                    {book.available_copies} copies available
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Reserve
                    </Button>
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <LibraryFooter />
    </div>
  );
};

export default Account;
