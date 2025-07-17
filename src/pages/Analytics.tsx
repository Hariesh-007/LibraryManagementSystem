import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState({ books: 0, borrows: 0, active: 0, overdue: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        // Total books
        const { count: books } = await supabase.from('books').select('id', { count: 'exact', head: true });
        // Total borrows
        const { count: borrows } = await supabase.from('borrow_records').select('id', { count: 'exact', head: true });
        // Active borrows
        const { count: active } = await supabase.from('borrow_records').select('id', { count: 'exact', head: true }).eq('status', 'borrowed');
        // Overdue borrows
        const { count: overdue } = await supabase.from('borrow_records').select('id', { count: 'exact', head: true }).eq('status', 'overdue');
        // Borrows per month (last 6 months)
        const { data: records } = await supabase
          .from('borrow_records')
          .select('id, borrowed_at')
          .gte('borrowed_at', new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString());
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          return d.toLocaleString('default', { month: 'short', year: '2-digit' });
        });
        const counts = months.map(label => ({ label, count: 0 }));
        records?.forEach(r => {
          const d = new Date(r.borrowed_at);
          const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
          const idx = counts.findIndex(c => c.label === label);
          if (idx !== -1) counts[idx].count++;
        });
        setStats({ books: books || 0, borrows: borrows || 0, active: active || 0, overdue: overdue || 0 });
        setChartData(counts);
      } catch (e) {
        setError('Failed to load analytics.');
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LibraryNavbar />
      <main className="flex-1 flex flex-col items-center py-12 px-4 w-full">
        <h1 className="text-3xl font-bold mb-4 text-indigo-800">View Analytics</h1>
        {loading ? <p>Loading...</p> : error ? <p className="text-red-600">{error}</p> : (
          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-indigo-700">{stats.books}</div>
                <div className="text-sm text-muted-foreground">Total Books</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-indigo-700">{stats.borrows}</div>
                <div className="text-sm text-muted-foreground">Total Borrows</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-indigo-700">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Active Borrows</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-indigo-700">{stats.overdue}</div>
                <div className="text-sm text-muted-foreground">Overdue Borrows</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Borrows Per Month (Last 6 Months)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
      <LibraryFooter />
    </div>
  );
};

export default Analytics; 