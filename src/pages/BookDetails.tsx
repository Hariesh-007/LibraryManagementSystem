import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import BookReviews from '@/components/BookReviews';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Calendar, 
  Building, 
  Hash, 
  Users, 
  Heart, 
  Share2, 
  ArrowLeft,
  Star,
  ShoppingCart,
  Clock,
  MapPin
} from "lucide-react";

interface BookDetails {
  id: string;
  title: string;
  author: string;
  description: string;
  isbn: string;
  category: string;
  cover_url: string;
  available_copies: number;
  total_copies: number;
  published_year: number;
  publisher: string;
  pages: number;
  language: string;
  rating: number;
  reviews_count: number;
  dimensions: string;
  weight: string;
  location: string;
  call_number: string;
}

const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isReserved, setIsReserved] = useState(false);

  // Mock book data - in real app, this would come from API
  const mockBook: BookDetails = {
    id: '1',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    description: 'Some books on algorithms are rigorous but incomplete; others cover masses of material but lack rigor. Introduction to Algorithms uniquely combines rigor and comprehensiveness. The book covers a broad range of algorithms in depth, yet makes their design and analysis accessible to all levels of readers. Each chapter is relatively self-contained and can be used as a unit of study. The algorithms are described in English and in a pseudocode designed to be readable by anyone who has done a little programming. The explanations have been kept elementary without sacrificing depth of coverage or mathematical rigor.',
    isbn: '978-0262033848',
    category: 'Computer Science',
    cover_url: '/placeholder.svg',
    available_copies: 3,
    total_copies: 5,
    published_year: 2009,
    publisher: 'MIT Press',
    pages: 1312,
    language: 'English',
    rating: 4.5,
    reviews_count: 127,
    dimensions: '9.3 x 2.4 x 7.5 inches',
    weight: '3.8 pounds',
    location: 'Floor 2, Section CS, Shelf A-15',
    call_number: 'QA76.6 .C662 2009'
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setBook(mockBook);
      setLoading(false);
    };

    fetchBookDetails();
  }, [id]);

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: isWishlisted 
        ? "Book removed from your wishlist."
        : "Book added to your wishlist.",
      duration: 2000,
    });
  };

  const handleReserve = () => {
    setIsReserved(!isReserved);
    toast({
      title: isReserved ? "Reservation Cancelled" : "Book Reserved",
      description: isReserved
        ? "Your reservation has been cancelled."
        : "Book reserved successfully. You'll be notified when it's available.",
      duration: 3000,
    });
  };

  const handleBorrow = () => {
    if (book && book.available_copies > 0) {
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book?.title,
        text: `Check out this book: ${book?.title} by ${book?.author}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Book link copied to clipboard.",
        duration: 2000,
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
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
            <p className="mt-4 text-gray-600">Loading book details...</p>
          </div>
        </div>
        <LibraryFooter />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-purple-50">
        <LibraryNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h1>
            <Button onClick={() => navigate('/catalog')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Catalog
            </Button>
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
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/catalog')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Image and Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <img 
                  src={book.cover_url} 
                  alt={book.title}
                  className="w-full h-96 object-cover rounded-lg mb-4"
                />
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  {book.available_copies > 0 ? (
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={handleBorrow}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Borrow Now
                    </Button>
                  ) : (
                    <Button 
                      variant={isReserved ? "secondary" : "outline"}
                      className="w-full"
                      onClick={handleReserve}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {isReserved ? 'Reserved' : 'Reserve Book'}
                    </Button>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={handleWishlist}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-current text-red-600' : ''}`} />
                      {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Availability Status */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Availability</span>
                    <Badge variant={book.available_copies > 0 ? "default" : "secondary"}>
                      {book.available_copies > 0 ? 'Available' : 'Checked Out'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {book.available_copies} of {book.total_copies} copies available
                  </div>
                </div>

                {/* Location Info */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {book.location}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Call Number: {book.call_number}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Details and Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book Information */}
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-3xl">{book.title}</CardTitle>
                  <p className="text-lg text-gray-600">by {book.author}</p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {renderStars(book.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        {book.rating.toFixed(1)} ({book.reviews_count} reviews)
                      </span>
                    </div>
                    <Badge>{book.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>

                {/* Book Details Grid */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Book Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">ISBN:</span>
                      <span className="text-sm text-gray-600">{book.isbn}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Published:</span>
                      <span className="text-sm text-gray-600">{book.published_year}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Publisher:</span>
                      <span className="text-sm text-gray-600">{book.publisher}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Pages:</span>
                      <span className="text-sm text-gray-600">{book.pages}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Language:</span>
                      <span className="text-sm text-gray-600">{book.language}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Dimensions:</span>
                      <span className="text-sm text-gray-600">{book.dimensions}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <BookReviews 
              bookId={book.id}
              bookTitle={book.title}
              averageRating={book.rating}
              totalReviews={book.reviews_count}
            />
          </div>
        </div>
      </div>

      <LibraryFooter />
    </div>
  );
};

export default BookDetailsPage;
