import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, BookOpen, Users, Calendar } from 'lucide-react';

type Book = {
  id: string;
  title: string;
  author?: string;
  description?: string;
  isbn?: string;
  category?: string;
  cover_url?: string;
  available_copies?: number;
  total_copies?: number;
  published_year?: number;
  publisher?: string;
};

const Catalog = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [existingReservations, setExistingReservations] = useState<{ [bookId: string]: string }>({});
  const [activeBorrows, setActiveBorrows] = useState<{ [bookId: string]: boolean }>({});
  const [role, setRole] = useState<'student' | 'staff' | null>('student'); // Demo mode defaults to student

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      let query = supabase.from('books').select('*').order('title');
      
      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,isbn.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching books:', error);
        // Use mock data for demo
        setBooks([
          {
            id: '1',
            title: 'Introduction to Algorithms',
            author: 'Thomas H. Cormen',
            category: 'Computer Science',
            description: 'A comprehensive introduction to the modern study of computer algorithms.',
            available_copies: 3,
            total_copies: 5,
            published_year: 2009,
            isbn: '978-0262033848'
          },
          {
            id: '2',
            title: 'Clean Code',
            author: 'Robert C. Martin',
            category: 'Software Engineering',
            description: 'A handbook of agile software craftsmanship.',
            available_copies: 2,
            total_copies: 4,
            published_year: 2008,
            isbn: '978-0132350884'
          },
          {
            id: '3',
            title: 'Design Patterns',
            author: 'Gang of Four',
            category: 'Software Engineering',
            description: 'Elements of reusable object-oriented software.',
            available_copies: 1,
            total_copies: 3,
            published_year: 1994,
            isbn: '978-0201633612'
          }
        ]);
        
        setCategories(['Computer Science', 'Software Engineering', 'Mathematics', 'Physics']);
      } else {
        setBooks(data || []);
        // Extract unique categories
        const uniqueCategories = Array.from(new Set((data || []).map(book => book.category).filter(Boolean)));
        setCategories(uniqueCategories);
      }
      
      setLoading(false);
    };
    fetchBooks();
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    // Mock data for demo mode
    setExistingReservations({});
    setActiveBorrows({});
  }, []);

  const handleReserve = async (book: Book) => {
    // Demo mode - simulate reservation
    toast({
      title: "Demo Mode",
      description: "In demo mode, reservations are simulated. Book would be reserved successfully.",
      duration: 4000,
    });
    
    // Update local state to simulate reservation
    setExistingReservations(prev => ({
      ...prev,
      [book.id]: 'reserved'
    }));
  };

  const handleBorrow = async (book: Book) => {
    // Demo mode - simulate borrowing
    toast({
      title: "Demo Mode",
      description: "In demo mode, borrowing is simulated. Book would be borrowed successfully.",
      duration: 4000,
    });
    
    // Update local state to simulate borrow
    setActiveBorrows(prev => ({
      ...prev,
      [book.id]: true
    }));
  };

  const getActionButton = (book: Book) => {
    const isReserved = existingReservations[book.id];
    const isBorrowed = activeBorrows[book.id];
    
    if (isBorrowed) {
      return (
        <Badge variant="secondary" className="w-full justify-center">
          Already Borrowed
        </Badge>
      );
    }
    
    if (isReserved) {
      return (
        <Badge variant="outline" className="w-full justify-center">
          {isReserved === 'reserved' ? 'Reserved' : 'Waitlisted'}
        </Badge>
      );
    }
    
    if (book.available_copies && book.available_copies > 0) {
      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleBorrow(book)} className="flex-1">
            Borrow
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleReserve(book)} className="flex-1">
            Reserve
          </Button>
        </div>
      );
    }
    
    return (
      <Button size="sm" variant="outline" onClick={() => handleReserve(book)} className="w-full">
        Join Waitlist
      </Button>
    );
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = !searchTerm.trim() || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (book.isbn && book.isbn.includes(searchTerm));
    
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LibraryNavbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">Book Catalog</h1>
          <p className="text-xl text-center opacity-90">
            Discover thousands of books in our digital library
          </p>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground">Loading books...</div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Found {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{book.category}</Badge>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="w-4 h-4 mr-1" />
                          {book.available_copies}/{book.total_copies}
                        </div>
                      </div>
                      
                      {book.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {book.description}
                        </p>
                      )}
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {book.published_year && `Published ${book.published_year}`}
                      </div>
                      
                      {role === 'student' && getActionButton(book)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      <LibraryFooter />
    </div>
  );
};

export default Catalog;
