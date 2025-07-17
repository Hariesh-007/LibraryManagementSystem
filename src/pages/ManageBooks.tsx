import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

const initialForm = { title: '', author: '', isbn: '', cover_url: '', category: '', is_digital: false, description: '', digital_url: '' };

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setForm({ ...form, cover_url: '' }); // Clear URL when file is selected
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
    let imageUrl = form.cover_url;
    if (selectedFile) {
      imageUrl = await uploadImage();
      if (!imageUrl) return; // Upload failed
    }
    const bookData = { ...form, cover_url: imageUrl };
    if (!bookData.is_digital) bookData.digital_url = '';
    if (editingId) {
      const { error } = await supabase.from('books').update(bookData).eq('id', editingId);
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setForm(initialForm);
        setSelectedFile(null);
        setShowModal(false);
        fetchBooks();
      }
    } else {
      const { error } = await supabase.from('books').insert([bookData]);
      if (error) setError(error.message);
      else {
        setForm(initialForm);
        setSelectedFile(null);
        setShowModal(false);
        fetchBooks();
      }
    }
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      cover_url: book.cover_url || '',
      category: book.category || '',
      is_digital: !!book.is_digital,
      description: book.description || '',
      digital_url: book.digital_url || '',
    });
    setSelectedFile(null);
    setShowModal(true);
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
    setShowModal(false);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setSelectedFile(null);
    setShowModal(true);
  };

  // Filter books by search
  const filteredBooks = books.filter(book => {
    const q = search.toLowerCase();
    return (
      book.title?.toLowerCase().includes(q) ||
      book.author?.toLowerCase().includes(q) ||
      (book.isbn || '').toLowerCase().includes(q) ||
      (book.category || '').toLowerCase().includes(q) ||
      (book.description || '').toLowerCase().includes(q)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LibraryNavbar />
      <main className="flex-1 flex flex-col items-center py-12 px-4 w-full">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-800">Manage Books</h1>
            <button 
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Book
            </button>
          </div>
          <div className="w-full mb-4">
            <Input
              placeholder="Search by title, author, category, description, or ISBN..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mb-2"
            />
          </div>
          {loading ? <p>Loading...</p> : (
            <>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Cover</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Digital?</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Digital URL</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBooks.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center">No books found.</TableCell></TableRow>
                  ) : currentBooks.map(book => (
                    <TableRow key={book.id}>
                      <TableCell>
                        {book.cover_url ? (
                          <img src={book.cover_url} alt={book.title} className="w-12 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.isbn}</TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell>{book.is_digital ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="max-w-xs whitespace-pre-line break-words">{book.description}</TableCell>
                      <TableCell>
                        {book.is_digital && book.digital_url ? (
                          <a href={book.digital_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open</a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2" onClick={() => handleEdit(book)}>Edit</button>
                        <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDelete(book.id)}>Delete</button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              {filteredBooks.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredBooks.length)} of {filteredBooks.length} books
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded border ${
                            currentPage === page 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <LibraryFooter />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-indigo-800">
                {editingId ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button 
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
                <Input name="author" placeholder="Author" value={form.author} onChange={handleChange} required />
                <Input name="isbn" placeholder="ISBN" value={form.isbn} onChange={handleChange} />
              </div>
              <div className="flex gap-4">
                <Input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="is_digital"
                    checked={form.is_digital}
                    onChange={handleChange}
                    className="accent-indigo-600"
                  />
                  Digital Book
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-3 py-2 min-h-[60px]"
                  placeholder="Book description..."
                />
              </div>
              {form.is_digital && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Digital Book URL</label>
                  <Input
                    name="digital_url"
                    placeholder="https://..."
                    value={form.digital_url}
                    onChange={handleChange}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Book Cover Image</label>
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
                {form.cover_url && !selectedFile && (
                  <div className="text-sm text-gray-600">
                    Current image: {form.cover_url}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : (editingId ? 'Update Book' : 'Add Book')}
                </button>
                <button 
                  type="button" 
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" 
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks; 