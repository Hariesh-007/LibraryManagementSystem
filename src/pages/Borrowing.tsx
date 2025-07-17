import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

const Borrowing = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [bookFilter, setBookFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError('');
      // Fetch all borrow_records, join students and books
      const { data, error } = await supabase
        .from('borrow_records')
        .select('id, borrowed_at, due_at, returned_at, status, student_id, book_id, students(name, email), books(title, author)');
      if (error) setError(error.message);
      else setRecords(data || []);
      setLoading(false);
    };
    fetchRecords();
  }, []);

  // Filter records by student, book, and date
  const filteredRecords = records.filter(r => {
    const studentMatch = r.students?.name?.toLowerCase().includes(studentFilter.toLowerCase()) || r.student_id?.toString().includes(studentFilter);
    const bookMatch = r.books?.title?.toLowerCase().includes(bookFilter.toLowerCase()) || r.book_id?.toString().includes(bookFilter);
    let dateMatch = true;
    if (dateFrom) dateMatch = dateMatch && new Date(r.borrowed_at) >= new Date(dateFrom);
    if (dateTo) dateMatch = dateMatch && new Date(r.borrowed_at) <= new Date(dateTo);
    return studentMatch && bookMatch && dateMatch;
  });

  // Existing Oversee Borrowing logic (active/overdue)
  const activeRecords = records.filter(r => r.status === 'borrowed' || r.status === 'overdue');
  const handleReturned = async (id) => {
    const { error } = await supabase
      .from('borrow_records')
      .update({ status: 'returned', returned_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) setRecords(records.filter(r => r.id !== id));
    else alert(error.message);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LibraryNavbar />
      <main className="flex-1 flex flex-col items-center py-12 px-4 w-full">
        <h1 className="text-3xl font-bold mb-4 text-indigo-800">Borrow/Return History</h1>
        <div className="w-full max-w-5xl mb-8">
          <div className="flex flex-wrap gap-4 mb-4">
            <Input placeholder="Filter by student name or ID" value={studentFilter} onChange={e => setStudentFilter(e.target.value)} className="w-48" />
            <Input placeholder="Filter by book title or ID" value={bookFilter} onChange={e => setBookFilter(e.target.value)} className="w-48" />
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40" />
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40" />
          </div>
          {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
            <Table className="w-full text-xs md:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead>Borrowed At</TableHead>
                  <TableHead>Due At</TableHead>
                  <TableHead>Returned At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center">No records found.</TableCell></TableRow>
                ) : filteredRecords.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.students?.name || r.student_id}</TableCell>
                    <TableCell>{r.books?.title || r.book_id}</TableCell>
                    <TableCell>{new Date(r.borrowed_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(r.due_at).toLocaleDateString()}</TableCell>
                    <TableCell>{r.returned_at ? new Date(r.returned_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{r.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <h2 className="text-2xl font-semibold mb-4">Oversee Active/Overdue Borrowing</h2>
        {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
          <Table className="w-full max-w-4xl">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Borrowed At</TableHead>
                <TableHead>Due At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeRecords.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No active or overdue borrows.</TableCell></TableRow>
              ) : activeRecords.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.students?.name || r.student_id}</TableCell>
                  <TableCell>{r.books?.title || r.book_id}</TableCell>
                  <TableCell>{new Date(r.borrowed_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(r.due_at).toLocaleDateString()}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => handleReturned(r.id)}>Mark Returned</button>
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

export default Borrowing; 