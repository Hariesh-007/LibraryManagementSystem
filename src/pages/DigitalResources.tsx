import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Book {
  id: string;
  title: string;
  author?: string;
  description?: string;
  isbn?: string;
  download_url?: string;
  cover_url?: string;
}

const DigitalResources = () => {
  const [resources, setResources] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_digital', true);
      setResources(data || []);
      setLoading(false);
    };
    fetchResources();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <LibraryNavbar />
      <main className="container mx-auto px-4 py-12 min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-8">Digital Resources</h1>
        {loading ? <div>Loading...</div> : resources.length === 0 ? (
          <div className="text-muted-foreground">No digital resources found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map(resource => (
              <Card key={resource.id} className="shadow-card flex items-center gap-4">
                <img
                  src={resource.cover_url || '/placeholder.svg'}
                  alt={resource.title}
                  className="w-24 h-32 object-cover rounded"
                />
                <div className="flex-1">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {resource.author && <div className="text-muted-foreground mb-1">by {resource.author}</div>}
                    {resource.description && <div className="mb-2">{resource.description}</div>}
                    <div className="text-sm text-muted-foreground mb-2">ISBN: {resource.isbn || 'N/A'}</div>
                    {resource.download_url && (
                      <a href={resource.download_url} target="_blank" rel="noopener noreferrer" className="text-accent underline">Download / View</a>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <LibraryFooter />
    </div>
  );
};

export default DigitalResources; 