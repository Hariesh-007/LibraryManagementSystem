import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Book {
  id: string;
  title: string;
  author?: string;
  description?: string;
  isbn?: string;
  category?: string;
  cover_url?: string;
  available_copies?: number;
}

const Catalog = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingReservations, setExistingReservations] = useState<{ [bookId: string]: string }>({});
  const [activeBorrows, setActiveBorrows] = useState<{ [bookId: string]: boolean }>({});
  const [role, setRole] = useState<'student' | 'staff' | null>(null);

  // Add this mapping for category images
  const categoryImages: { [key: string]: string } = {
    "Science": "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    "Literature": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80",
    "Technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    "History": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    "Mathematics": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    "Art": "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
    "Business": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80",
    "Philosophy": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    "Engineering": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
    "Medicine": "https://images.unsplash.com/photo-1519494080410-f9aa8f0dfbfc?auto=format&fit=crop&w=400&q=80",
    "Law": "https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=400&q=80",
    "Psychology": "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80",
    "Education": "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80",
    "Music": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    "Sports": "https://images.unsplash.com/photo-1505843275257-8491bfa3b43c?auto=format&fit=crop&w=400&q=80",
    "Comics": "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    "Children": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80",
    "Travel": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    "Cooking": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    "Religion": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    "Politics": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    "Fiction": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
    "Non-Fiction": "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    "Chemistry": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    "Physics": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80",
    "Data Science": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
    "Computer Science": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('books').select('category');
      if (!error && data) {
        const unique = Array.from(new Set(data.map((b: any) => b.category).filter(Boolean)));
        setCategories(unique);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('category', selectedCategory);
      setBooks(data || []);
      setLoading(false);
    };
    fetchBooks();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchExistingReservations = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      const { data: reservations } = await supabase
        .from('reservations')
        .select('book_id, status')
        .eq('user_id', authData.user.id)
        .in('status', ['reserved', 'waitlisted']);
      const map: { [bookId: string]: string } = {};
      (reservations || []).forEach((r: any) => { map[r.book_id] = r.status; });
      setExistingReservations(map);
      // Fetch active borrows
      const { data: borrows } = await supabase
        .from('borrow_records')
        .select('book_id, returned_at')
        .eq('student_id', authData.user.id);
      const borrowMap: { [bookId: string]: boolean } = {};
      (borrows || []).forEach((b: any) => {
        if (!b.returned_at) borrowMap[b.book_id] = true;
      });
      setActiveBorrows(borrowMap);
    };
    if (selectedCategory) fetchExistingReservations();
  }, [selectedCategory]);

  useEffect(() => {
    // Determine user role
    const fetchRole = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setRole(null);
        return;
      }
      // Check students table
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('email', authData.user.email)
        .single();
      if (student) {
        setRole('student');
        return;
      }
      // Check staff table
      const { data: staff } = await supabase
        .from('staff')
        .select('id')
        .eq('email', authData.user.email)
        .single();
      if (staff) {
        setRole('staff');
        return;
      }
      setRole(null);
    };
    fetchRole();
  }, []);

  const handleReserve = async (book: Book) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to reserve books.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    const status = (book.available_copies && book.available_copies > 0) ? 'reserved' : 'waitlisted';
    const { error } = await supabase.from('reservations').insert({
      user_id: authData.user.id,
      book_id: book.id,
      status,
    });
    if (error) {
      toast({
        title: "Reservation Failed",
        description: "Failed to reserve. You may already have a reservation or waitlist for this book.",
        variant: "destructive",
        duration: 4000,
      });
    } else {
      toast({
        title: "Success!",
        description: status === 'reserved' ? 'Book reserved successfully!' : 'Added to waitlist.',
        duration: 3000,
      });
    }
  };

  const handleBorrow = async (book: Book) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to borrow books.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    // Check again if available
    if (!book.available_copies || book.available_copies < 1) {
      toast({
        title: "Book Unavailable",
        description: "No copies available to borrow.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    // Look up student id from students table using email
    const { data: studentRow, error: studentLookupError } = await supabase
      .from('students')
      .select('id')
      .eq('email', authData.user.email)
      .single();
    if (studentLookupError || !studentRow) {
      toast({
        title: "Student Record Error",
        description: "Student record not found. Please contact the library.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    const studentId = studentRow.id;
    // Check for existing active borrow
    const { data: existingBorrows, error: borrowCheckError } = await supabase
      .from('borrow_records')
      .select('id')
      .eq('student_id', studentId)
      .eq('book_id', book.id)
      .is('returned_at', null);
    if (borrowCheckError) {
      toast({
        title: "System Error",
        description: "Error checking existing borrows. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
      console.error('Supabase borrow check error:', borrowCheckError);
      return;
    }
    if (existingBorrows && existingBorrows.length > 0) {
      toast({
        title: "Already Borrowed",
        description: "You already have an active borrow for this book.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    // Check total number of active borrows (4-book limit)
    const { data: allActiveBorrows, error: activeBorrowsError } = await supabase
      .from('borrow_records')
      .select('id')
      .eq('student_id', studentId)
      .is('returned_at', null);
    
    if (activeBorrowsError) {
      toast({
        title: "System Error",
        description: "Error checking your current borrows. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
      console.error('Supabase active borrows check error:', activeBorrowsError);
      return;
    }
    
    if (allActiveBorrows && allActiveBorrows.length >= 4) {
      toast({
        title: "Borrowing Limit Reached",
        description: "You have reached the maximum limit of 4 borrowed books. Please return a book before borrowing another.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    // Set due date (e.g., 14 days from now)
    const borrowedAt = new Date();
    const dueAt = new Date();
    dueAt.setDate(borrowedAt.getDate() + 14);
    // Create borrow record
    const { error: borrowError } = await supabase.from('borrow_records').insert({
      student_id: studentId,
      book_id: book.id,
      borrowed_at: borrowedAt.toISOString(),
      due_at: dueAt.toISOString(),
      status: 'borrowed',
    });
    if (borrowError) {
      toast({
        title: "Borrowing Failed",
        description: "Failed to borrow book. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
      console.error('Supabase borrow insert error:', borrowError);
      return;
    }
    // Decrement available copies
    const { error: updateError } = await supabase.from('books').update({
      available_copies: (book.available_copies || 1) - 1
    }).eq('id', book.id);
    if (updateError) {
      toast({
        title: "Update Failed",
        description: "Failed to update book availability. Please contact support.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    toast({
      title: "Success!",
      description: "Book borrowed successfully!",
      duration: 3000,
    });
    // Refresh book list and borrows
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <LibraryNavbar />
      <main className="container mx-auto px-4 py-12 min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-8">Browse by Category</h1>
        {!selectedCategory ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Card key={cat} className="cursor-pointer hover:shadow-glow transition-bounce" onClick={() => setSelectedCategory(cat)}>
                <CardHeader className="flex flex-col items-center">
                  <img
                    src={categoryImages[cat] || '/placeholder.svg'}
                    alt={cat + ' category'}
                    className="w-16 h-16 object-cover mb-2 rounded-full bg-muted"
                  />
                  <CardTitle className="text-lg text-primary text-center">{cat}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div>
            <button className="mb-6 text-accent underline" onClick={() => setSelectedCategory(null)}>&larr; Back to Categories</button>
            <h2 className="text-2xl font-semibold mb-4">{selectedCategory}</h2>
            {loading ? <div>Loading...</div> : books.length === 0 ? (
              <div className="text-muted-foreground">No books found in this category.</div>
            ) : (
              <ul className="space-y-6">
                {books.map(book => (
                  <li key={book.id} className="bg-card rounded-lg shadow-card p-6 flex items-center gap-4">
                    <img
                      src={book.cover_url || '/placeholder.svg'}
                      alt={book.title}
                      className="w-24 h-32 object-cover rounded"
                    />
                    <div>
                      <div className="text-xl font-semibold mb-2">{book.title}</div>
                      {book.author && <div className="text-muted-foreground mb-1">by {book.author}</div>}
                      {book.description && <div className="mb-2">{book.description}</div>}
                      <div className="text-sm text-muted-foreground">ISBN: {book.isbn || 'N/A'}</div>
                      <div className="text-sm mt-2">Available Copies: {book.available_copies ?? 'N/A'}</div>
                      {role === 'staff' ? (
                        <div className="mt-2 text-blue-700 font-semibold">Staff cannot borrow or reserve books.</div>
                      ) : (
                        <button
                          className={`mt-2 px-4 py-2 rounded text-white ${book.available_copies && book.available_copies > 0 ? 'bg-primary hover:bg-primary/90' : 'bg-accent hover:bg-accent/80'}`}
                          onClick={() => book.available_copies && book.available_copies > 0 ? handleBorrow(book) : handleReserve(book)}
                          disabled={!!existingReservations[book.id] || !!activeBorrows[book.id]}
                        >
                          {activeBorrows[book.id]
                            ? 'Already Borrowed'
                            : existingReservations[book.id]
                              ? (existingReservations[book.id] === 'reserved' ? 'Already Reserved' : 'On Waitlist')
                              : (book.available_copies && book.available_copies > 0 ? 'Borrow' : 'Join Waitlist')}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
      <LibraryFooter />
    </div>
  );
};

export default Catalog; 