import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const ApproveReturns = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError('');
      // Fetch borrow_records with status 'pending_return', join students and books
      const { data, error } = await supabase
        .from('borrow_records')
        .select('id, borrowed_at, due_at, student_id, book_id, students(name, email), books(title, author)')
        .eq('status', 'pending_return');
      if (error) setError(error.message);
      else setRecords(data || []);
      setLoading(false);
    };
    fetchRecords();
  }, []);

  const handleApprove = async (id) => {
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
        <h1 className="text-3xl font-bold mb-4 text-indigo-800">Approve Returns</h1>
        {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
          <Table className="w-full max-w-4xl">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Borrowed At</TableHead>
                <TableHead>Due At</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center">No pending returns.</TableCell></TableRow>
              ) : records.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.students?.name || r.student_id}</TableCell>
                  <TableCell>{r.books?.title || r.book_id}</TableCell>
                  <TableCell>{new Date(r.borrowed_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(r.due_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleApprove(r.id)}>Approve</button>
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

export default ApproveReturns; 