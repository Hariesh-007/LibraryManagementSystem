import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import AdvancedSearch from '@/components/AdvancedSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Users, Calendar, Star, Heart, ShoppingCart, Eye } from 'lucide-react';

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
  rating?: number;
  reviews_count?: number;
};

interface SearchFilters {
  query: string;
  category: string;
  author: string;
  year: string;
  availability: string;
}

const Catalog = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    author: '',
    year: '',
    availability: ''
  });
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [reservations, setReservations] = useState<Set<string>>(new Set());

  // Mock data for demonstration
  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      category: 'Computer Science',
      description: 'A comprehensive introduction to the modern study of computer algorithms.',
      isbn: '978-0262033848',
      cover_url: '/placeholder.svg',
      available_copies: 3,
      total_copies: 5,
      published_year: 2009,
      publisher: 'MIT Press',
      rating: 4.5,
      reviews_count: 127
    },
    {
      id: '2',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Software Engineering',
      description: 'A handbook of agile software craftsmanship.',
      isbn: '978-0132350884',
      cover_url: '/placeholder.svg',
      available_copies: 2,
      total_copies: 4,
      published_year: 2008,
      publisher: 'Prentice Hall',
      rating: 4.3,
      reviews_count: 89
    },
    {
      id: '3',
      title: 'The Pragmatic Programmer',
      author: 'David Thomas',
      category: 'Software Engineering',
      description: 'Your journey to mastery in software development.',
      isbn: '978-0201616224',
      cover_url: '/placeholder.svg',
      available_copies: 1,
      total_copies: 3,
      published_year: 1999,
      publisher: 'Addison-Wesley',
      rating: 4.4,
      reviews_count: 156
    },
    {
      id: '4',
      title: 'Design Patterns',
      author: 'Gang of Four',
      category: 'Software Engineering',
      description: 'Elements of reusable object-oriented software.',
      isbn: '978-0201633612',
      cover_url: '/placeholder.svg',
      available_copies: 0,
      total_copies: 2,
      published_year: 1994,
      publisher: 'Addison-Wesley',
      rating: 4.2,
      reviews_count: 203
    },
    {
      id: '5',
      title: 'Calculus',
      author: 'James Stewart',
      category: 'Mathematics',
      description: 'Early transcendentals mathematics textbook.',
      isbn: '978-1285741550',
      cover_url: '/placeholder.svg',
      available_copies: 5,
      total_copies: 8,
      published_year: 2015,
      publisher: 'Cengage Learning',
      rating: 4.1,
      reviews_count: 78
    },
    {
      id: '6',
      title: 'Physics for Scientists and Engineers',
      author: 'Raymond A. Serway',
      category: 'Physics',
      description: 'Comprehensive physics textbook with modern physics.',
      isbn: '978-1133947271',
      cover_url: '/placeholder.svg',
      available_copies: 4,
      total_copies: 6,
      published_year: 2013,
      publisher: 'Brooks Cole',
      rating: 4.0,
      reviews_count: 145
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchBooks = async () => {
      setLoading(true);
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBooks(mockBooks);
      setFilteredBooks(mockBooks);
      setLoading(false);
    };

    fetchBooks();
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
    
    let filtered = books.filter(book => {
      // Query filter (title, author, ISBN)
      if (filters.query.trim()) {
        const query = filters.query.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(query);
        const matchesAuthor = book.author?.toLowerCase().includes(query) || false;
        const matchesISBN = book.isbn?.toLowerCase().includes(query) || false;
        
        if (!matchesTitle && !matchesAuthor && !matchesISBN) {
          return false;
        }
      }

      // Category filter
      if (filters.category && book.category !== filters.category) {
        return false;
      }

      // Author filter
      if (filters.author.trim() && !book.author?.toLowerCase().includes(filters.author.toLowerCase())) {
        return false;
      }

      // Year filter
      if (filters.year && book.published_year?.toString() !== filters.year) {
        return false;
      }

      // Availability filter
      if (filters.availability) {
        switch (filters.availability) {
          case 'available':
            return (book.available_copies || 0) > 0;
          case 'borrowed':
            return (book.available_copies || 0) === 0;
          case 'reserved':
            return reservations.has(book.id);
          default:
            return true;
        }
      }

      return true;
    });

    setFilteredBooks(filtered);

    toast({
      title: "Search Results",
      description: `Found ${filtered.length} book(s) matching your criteria.`,
      duration: 2000,
    });
  };

  const handleClearSearch = () => {
    setCurrentFilters({
      query: '',
      category: '',
      author: '',
      year: '',
      availability: ''
    });
    setFilteredBooks(books);
  };

  const toggleWishlist = (bookId: string) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(bookId)) {
        newWishlist.delete(bookId);
        toast({
          title: "Removed from Wishlist",
          description: "Book removed from your wishlist.",
          duration: 2000,
        });
      } else {
        newWishlist.add(bookId);
        toast({
          title: "Added to Wishlist",
          description: "Book added to your wishlist.",
          duration: 2000,
        });
      }
      return newWishlist;
    });
  };

  const handleReserve = (book: Book) => {
    if (reservations.has(book.id)) {
      setReservations(prev => {
        const newReservations = new Set(prev);
        newReservations.delete(book.id);
        return newReservations;
      });
      toast({
        title: "Reservation Cancelled",
        description: `Reservation for "${book.title}" has been cancelled.`,
        duration: 3000,
      });
    } else {
      setReservations(prev => new Set(prev).add(book.id));
      toast({
        title: "Book Reserved",
        description: `"${book.title}" has been reserved. You'll be notified when it's available.`,
        duration: 3000,
      });
    }
  };

  const handleBorrow = (book: Book) => {
    if ((book.available_copies || 0) > 0) {
      toast({
        title: "Book Borrowed",
        description: `"${book.title}" has been borrowed successfully. Due date: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
        duration: 3000,
      });
    } else {
      toast({
        title: "Book Unavailable",
        description: "This book is currently not available for borrowing.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-purple-50">
        <LibraryNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading catalog...</p>
          </div>
        </div>
        <LibraryFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-purple-50">
      <LibraryNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Library Catalog</h1>
          <p className="text-gray-600">Discover and borrow from our extensive collection</p>
        </div>

        {/* Advanced Search Component */}
        <AdvancedSearch onSearch={handleSearch} onClear={handleClearSearch} />

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredBooks.length} of {books.length} books
            {Object.values(currentFilters).some(filter => filter.trim() !== '') && 
              " (filtered)"
            }
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="relative">
                  <img 
                    src={book.cover_url || '/placeholder.svg'} 
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      wishlist.has(book.id) 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-white/80 text-gray-600'
                    }`}
                    onClick={() => toggleWishlist(book.id)}
                  >
                    <Heart className={`h-4 w-4 ${wishlist.has(book.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div>
                  <CardTitle className="text-lg mb-1 line-clamp-2">{book.title}</CardTitle>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(book.rating || 0)}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({book.reviews_count} reviews)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{book.category}</Badge>
                  <span className="text-sm text-gray-500">
                    {book.published_year}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span>
                    {book.available_copies}/{book.total_copies} available
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {book.description}
                </p>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {(book.available_copies || 0) > 0 ? (
                    <Button 
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleBorrow(book)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Borrow
                    </Button>
                  ) : (
                    <Button 
                      variant={reservations.has(book.id) ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleReserve(book)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {reservations.has(book.id) ? 'Reserved' : 'Reserve'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all available books.
            </p>
          </div>
        )}
      </div>

      <LibraryFooter />
    </div>
  );
};

export default Catalog;
