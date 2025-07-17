import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

const initialForm = { title: '', author: '', isbn: '', image_url: '' };

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('books').select('*');
    if (error) setError(error.message);
    else setBooks(data || []);
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setForm({ ...form, image_url: '' }); // Clear URL when file is selected
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;
    
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('book-images')
        .upload(fileName, selectedFile);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('book-images')
        .getPublicUrl(fileName);
      
      setUploading(false);
      setSelectedFile(null);
      return urlData.publicUrl;
    } catch (error) {
      setUploading(false);
      setError('Failed to upload image: ' + error.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author) return;
    
    let imageUrl = form.image_url;
    
    // Upload file if selected
    if (selectedFile) {
      imageUrl = await uploadImage();
      if (!imageUrl) return; // Upload failed
    }
    
    const bookData = { ...form, image_url: imageUrl };
    
    if (editingId) {
      const { error } = await supabase.from('books').update(bookData).eq('id', editingId);
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setForm(initialForm);
        setSelectedFile(null);
        fetchBooks();
      }
    } else {
      const { error } = await supabase.from('books').insert([bookData]);
      if (error) setError(error.message);
      else {
        setForm(initialForm);
        setSelectedFile(null);
        fetchBooks();
      }
    }
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setForm({ title: book.title, author: book.author, isbn: book.isbn || '', image_url: book.image_url || '' });
    setSelectedFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) setError(error.message);
    else fetchBooks();
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(initialForm);
    setSelectedFile(null);
  };

  // Filter books by search
  const filteredBooks = books.filter(book => {
    const q = search.toLowerCase();
    return (
      book.title?.toLowerCase().includes(q) ||
      book.author?.toLowerCase().includes(q) ||
      (book.isbn || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LibraryNavbar />
      <main className="flex-1 flex flex-col items-center py-12 px-4 w-full">
        <h1 className="text-3xl font-bold mb-4 text-indigo-800">Manage Books</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8 w-full max-w-xl flex flex-col gap-4">
          <div className="flex gap-4">
            <Input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
            <Input name="author" placeholder="Author" value={form.author} onChange={handleChange} required />
            <Input name="isbn" placeholder="ISBN" value={form.isbn} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Book Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="border border-gray-300 rounded px-3 py-2"
            />
            {selectedFile && (
              <div className="text-sm text-blue-600">
                Selected: {selectedFile.name}
              </div>
            )}
            {form.image_url && !selectedFile && (
              <div className="text-sm text-gray-600">
                Current image: {form.image_url}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : (editingId ? 'Update Book' : 'Add Book')}
            </button>
            {editingId && (
              <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </form>
        <div className="w-full max-w-4xl mb-4">
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-2"
          />
        </div>
        {loading ? <p>Loading...</p> : (
          <Table className="w-full max-w-4xl">
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center">No books found.</TableCell></TableRow>
              ) : filteredBooks.map(book => (
                <TableRow key={book.id}>
                  <TableCell>
                    {book.image_url ? (
                      <img src={book.image_url} alt={book.title} className="w-12 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.isbn}</TableCell>
                  <TableCell>
                    <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2" onClick={() => handleEdit(book)}>Edit</button>
                    <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDelete(book.id)}>Delete</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
      <LibraryFooter />
    </div>
  );
};

export default ManageBooks; 