import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

type Book = {
  cover_url: string;
  download_url: string;
  id: string;
  title: string;
  author?: string;
  description?: string;
  isbn?: string;
};

const SearchResults = () => {
  const query = useQuery();
  const searchTerm = query.get('q') || '';
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm.trim()) return;
      setLoading(true);
      setError('');
      setResults([]);
      // Search by title or author (case-insensitive)
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`);

      if (error) {
        setError('Error fetching results.');
      } else {
        setResults(data || []);
      }
      setLoading(false);
    };

    fetchResults();
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <LibraryNavbar />
      <main className="container mx-auto px-4 py-12 min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-8">Search Results for "{searchTerm}"</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600 text-2xl font-bold mb-6 bg-red-100 border border-red-400 rounded-lg p-4 shadow-md flex items-center justify-center">{`No results found`}</div>}
        {!loading && !error && results.length === 0 && (
          <div className="text-lg text-muted-foreground">No books found matching your search.</div>
        )}
        {!loading && !error && results.length > 0 && (
          <ul className="space-y-6">
            {results.map(book => (
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <LibraryFooter />
    </div>
  );
};

export default SearchResults;