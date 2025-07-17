import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import LibraryNavbar from "@/components/LibraryNavbar";
import LibraryFooter from "@/components/LibraryFooter";
import { BookOpen } from "lucide-react";
import About from "./pages/About";
import SearchResults from "./pages/SearchResults";
import Catalog from "./pages/Catalog";
import DigitalResources from "./pages/DigitalResources";
import Account from './pages/Account';
import StaffLanding from './pages/StaffLanding';
import { Input } from "@/components/ui/input";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Box, Sphere } from '@react-three/drei';

const queryClient = new QueryClient();

// ErrorBoundary for 3D Canvas
type CanvasErrorBoundaryState = { hasError: boolean };
class CanvasErrorBoundary extends React.Component<React.PropsWithChildren<{}>, CanvasErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can log error here
  }
  render() {
    if (this.state.hasError) {
      return <div className="absolute inset-0 flex items-center justify-center z-0 bg-blue-100/80 text-blue-900 font-bold text-lg">3D animation failed to load.</div>;
    }
    return this.props.children;
  }
}

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      window.location.href = '/';
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMsg('');
    setError('');
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + '/reset-password',
    });
    setResetLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setResetMsg('Password reset email sent! Check your inbox.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-accent/10 overflow-hidden">
      {/* 3D Animated Background with Error Boundary */}
      <CanvasErrorBoundary>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={0.7} />
            <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.5}>
              <Box args={[1.2, 1.2, 1.2]} position={[-2, 1, 0]}>
                <meshStandardMaterial color="#f59e42" metalness={0.3} roughness={0.4} />
              </Box>
            </Float>
            <Float speed={1.5} rotationIntensity={0.7} floatIntensity={1.2}>
              <Sphere args={[0.8, 32, 32]} position={[2, -1, 0]}>
                <meshStandardMaterial color="#2563eb" metalness={0.2} roughness={0.5} />
              </Sphere>
            </Float>
            <Float speed={1.1} rotationIntensity={0.6} floatIntensity={1.3}>
              <Box args={[0.7, 0.7, 0.7]} position={[0, 2, -1]}>
                <meshStandardMaterial color="#fbbf24" metalness={0.2} roughness={0.6} />
              </Box>
            </Float>
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.7} />
          </Canvas>
        </div>
      </CanvasErrorBoundary>
      {/* Sign In Card */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col items-center backdrop-blur-md border border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <img src="/kl-university-logo.svg" alt="KL University Logo" className="h-14 mb-2" />
          <h1 className="text-3xl font-bold text-primary mb-1">Sign In</h1>
          <p className="text-muted-foreground text-base">Welcome back to <span className="font-semibold text-accent">KL SmartLibrary</span></p>
        </div>
        {!showForgot ? (
          <form onSubmit={handleSignIn} className="w-full space-y-5">
            <div>
              <label className="block mb-1 font-medium text-primary">Email</label>
              <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="block mb-1 font-medium text-primary">Password</label>
              <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-red-600 text-sm text-center font-medium mt-2">{error}</div>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-primary text-white font-semibold text-lg shadow-md hover:bg-primary/90 transition-bounce disabled:opacity-60 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="flex justify-between items-center mt-2">
              <button type="button" className="text-blue-600 hover:underline text-sm" onClick={() => setShowForgot(true)}>
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="w-full space-y-5">
            <div>
              <label className="block mb-1 font-medium text-primary">Email</label>
              <Input type="email" placeholder="Enter your email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
            </div>
            {resetMsg && <div className="text-green-600 text-sm text-center font-medium mt-2">{resetMsg}</div>}
            {error && <div className="text-red-600 text-sm text-center font-medium mt-2">{error}</div>}
            <button type="submit" disabled={resetLoading} className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-lg shadow-md hover:bg-blue-700 transition-bounce disabled:opacity-60 mt-2">
              {resetLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
            <div className="flex justify-between items-center mt-2">
              <button type="button" className="text-primary hover:underline text-sm" onClick={() => setShowForgot(false)}>
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
const GetStarted = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LibraryNavbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-gradient-card rounded-2xl shadow-book max-w-xl w-full p-8 md:p-12 text-center">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4">
              <BookOpen className="h-10 w-10 text-primary" />
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Get Started with KL SmartLibrary</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Unlock access to thousands of books, digital resources, and smart library features. Create your free account to:
          </p>
          <ul className="text-left mx-auto mb-8 text-base text-foreground max-w-md space-y-2">
            <li>• Reserve and borrow books online</li>
            <li>• Access digital journals and research papers</li>
            <li>• Get personalized recommendations</li>
            <li>• Track your reading and borrowing history</li>
            <li>• Join book clubs and academic discussions</li>
          </ul>
          <button
            className="bg-primary text-primary-foreground font-semibold rounded-lg px-8 py-3 text-lg shadow-card hover:bg-primary/90 transition-bounce"
            onClick={() => window.location.href = '/signin'}
          >
            Join Now
          </button>
        </div>
      </main>
      <LibraryFooter />
    </div>
  );
};
const ScheduleDemo = () => <div style={{padding: 40, textAlign: 'center'}}><h1>Schedule Demo</h1><p>This is a placeholder for the Schedule Demo page.</p></div>;

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    // Supabase sends the access token in the URL hash: #access_token=...
    const hash = window.location.hash;
    const match = hash.match(/access_token=([^&]+)/);
    if (match) {
      setToken(match[1]);
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    if (!token) {
      setError('No access token found. Please use the link from your email.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/signin';
      }, 2000);
    }
  };

  return (
    <div style={{padding: 40, textAlign: 'center'}}>
      <h1>Reset Password</h1>
      <form onSubmit={handleReset} style={{maxWidth: 320, margin: '0 auto'}}>
        <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required style={{width: '100%', marginBottom: 12, padding: 8}} />
        <button type="submit" disabled={loading} style={{width: '100%', padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4}}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        {error && <div style={{color: 'red', marginTop: 12}}>{error}</div>}
        {success && <div style={{color: 'green', marginTop: 12}}>Password updated! Redirecting to sign in...</div>}
      </form>
    </div>
  );
};

const StaffLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Fetch staff by email
    const { data, error: fetchError } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .single();
    if (fetchError || !data) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }
    // Simulate password hash check (replace with real hash check in production)
    if (password !== data.password_hash) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }
    // Set session role
    localStorage.setItem('role', 'staff');
    localStorage.setItem('staff_name', data.name);
    setLoading(false);
    navigate('/staff-dashboard');
  };

  return (
    <div style={{padding: 40, textAlign: 'center'}}>
      <h1>Staff Login</h1>
      <form onSubmit={handleStaffLogin} style={{maxWidth: 320, margin: '0 auto'}}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{width: '100%', marginBottom: 12, padding: 8}} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{width: '100%', marginBottom: 12, padding: 8}} />
        <button type="submit" disabled={loading} style={{width: '100%', padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4}}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div style={{color: 'red', marginTop: 12}}>{error}</div>}
      </form>
    </div>
  );
};

// Add type for recommended books
type RecommendedBook = { id: string; title: string; author?: string; count: number };

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendedBook[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndRecords = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        navigate('/signin');
        return;
      }
      setUser(authData.user);
      // Find the student by email
      const { data: studentData } = await supabase
        .from('students')
        .select('id, name, student_id')
        .eq('email', authData.user.email)
        .single();
      if (!studentData) {
        setLoading(false);
        return;
      }
      // Fetch borrow records for this student
      const { data: borrowData } = await supabase
        .from('borrow_records')
        .select('id, borrowed_at, due_at, status, returned_at, books(title, author, id)')
        .eq('student_id', studentData.id)
        .order('borrowed_at', { ascending: false });
      setRecords(borrowData || []);
      // Fetch recommended books: books not yet borrowed by this student, most borrowed by others
      const borrowedBookIds = (borrowData || []).map((r: any) => r.books?.id).filter(Boolean);
      // Fetch all borrow_records for other students
      const { data: allBorrows } = await supabase
        .from('borrow_records')
        .select('book_id, books(title, author, id)')
        .neq('student_id', studentData.id)
        .is('returned_at', null);
      // Count popularity
      const bookCount: Record<string, RecommendedBook> = {};
      (allBorrows || []).forEach((r: any) => {
        let book = r.books;
        if (Array.isArray(book)) {
          console.warn('Unexpected array for r.books in recommended logic:', book);
          book = book[0];
        }
        if (book && book.id && !borrowedBookIds.includes(book.id)) {
          if (!bookCount[book.id]) {
            bookCount[book.id] = { id: book.id, title: book.title, author: book.author, count: 0 };
          }
          bookCount[book.id].count++;
        }
      });
      // Sort by count and take top 5
      const recommended: RecommendedBook[] = Object.values(bookCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setRecommendations(recommended);
      setLoading(false);
    };
    fetchUserAndRecords();
  }, [navigate]);

  if (!user) return null;

  return (
    <div style={{padding: 40}}>
      <h1>My Borrowed Books</h1>
      {recommendations.length > 0 && (
        <div style={{marginBottom: 32}}>
          <h2>Recommended for you</h2>
          <ul>
            {recommendations.map(b => (
              <li key={b.id} style={{marginBottom: 8}}>
                <strong>{b.title}</strong>{b.author && ` by ${b.author}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      {loading ? <div>Loading...</div> : (
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr>
              <th>Book</th>
              <th>Borrowed At</th>
              <th>Due At</th>
              <th>Status</th>
              <th>Returned At</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id} style={{borderBottom: '1px solid #eee'}}>
                <td>{r.books?.title} {r.books?.author && `by ${r.books.author}`}</td>
                <td>{r.borrowed_at && new Date(r.borrowed_at).toLocaleString()}</td>
                <td>{r.due_at && new Date(r.due_at).toLocaleDateString()}</td>
                <td>{r.status}</td>
                <td>{r.returned_at ? new Date(r.returned_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Move StaffDashboard above App so it is in scope
const StaffDashboard = ({ role }) => {
  const [staffName, setStaffName] = useState(localStorage.getItem('staff_name'));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overdue, setOverdue] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(requests.length / pageSize);
  const paginatedRequests = requests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const [searchStudentId, setSearchStudentId] = useState("");

  // Pagination for return requests (filtered only)
  const [returnRequestsPage, setReturnRequestsPage] = useState(1);
  const returnRequestsPageSize = 10;
  const filteredReturnRequests = searchStudentId.trim()
    ? returnRequests.filter(r => r.students?.student_id?.toLowerCase().includes(searchStudentId.trim().toLowerCase()))
    : returnRequests;
  const returnRequestsTotalPages = Math.ceil(filteredReturnRequests.length / returnRequestsPageSize);
  const paginatedReturnRequests = filteredReturnRequests.slice((returnRequestsPage - 1) * returnRequestsPageSize, returnRequestsPage * returnRequestsPageSize);

  // Reset page if filter changes
  useEffect(() => {
    setReturnRequestsPage(1);
  }, [filteredReturnRequests.length]);

  useEffect(() => {
    if (role === null) return; // Wait until role is determined
    if (role !== 'staff') {
      navigate('/staff-login');
      return;
    }
    const fetchRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('borrow_records')
        .select('id, borrowed_at, due_at, status, returned_at, students(name, student_id), books(id, title, author, cover_url, available_copies)')
        .order('borrowed_at', { ascending: false });
      setRequests(data || []);
      // Overdue: due_at < now and not returned
      const now = new Date();
      setOverdue((data || []).filter(r => r.due_at && !r.returned_at && new Date(r.due_at) < now));
      setReturnRequests((data || []).filter(r => r.status === 'return_requested' && !r.returned_at));
      setBorrowedBooks((data || []).filter(r => r.status === 'borrowed' && !r.returned_at));
      setLoading(false);
    };
    fetchRequests();
  }, [role, navigate]);

  if (role === null) return null; // Or a loading spinner
  if (role !== 'staff') return null;

  const handleApproveReturn = async (record) => {
    setLoading(true);
    // Mark as returned
    await supabase.from('borrow_records').update({ status: 'returned', returned_at: new Date().toISOString() }).eq('id', record.id);
    // Increment book's available_copies (fallback to direct update if RPC not available)
    if (record.books?.id) {
      await supabase.from('books').update({ available_copies: (record.books.available_copies || 0) + 1 }).eq('id', record.books.id);
    }
    setReturnRequests(reqs => reqs.filter(r => r.id !== record.id));
    setRequests(reqs => reqs.map(r => r.id === record.id ? { ...r, status: 'returned', returned_at: new Date().toISOString() } : r));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-accent/10 flex flex-col">
      <LibraryNavbar />
      <main className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="relative rounded-2xl shadow-xl bg-card overflow-hidden mb-10">
            <div className="h-32 bg-gradient-to-r from-blue-500/90 to-accent/80" />
            <div className="pt-20 pb-8 px-6 flex flex-col items-center">
              <div className="text-2xl font-bold text-primary mb-1">{staffName || 'Staff'}</div>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500 text-white font-semibold mb-4 shadow">Staff Dashboard</span>
            </div>
          </div>

          {/* Return Requests Section */}
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Return Requests</h2>
            {/* Search by Student ID */}
            <div className="mb-4 max-w-xs">
              <Input
                placeholder="Search by Student ID..."
                value={searchStudentId}
                onChange={e => setSearchStudentId(e.target.value)}
                className=""
              />
            </div>
            {loading ? <div>Loading...</div> : filteredReturnRequests.length === 0 ? (
              <div className="text-muted-foreground">No pending return requests.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedReturnRequests.map(record => (
                    <div key={record.id} className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4 flex flex-col shadow">
                      <div className="flex items-center gap-4 mb-2">
                        <img src={record.books?.cover_url || '/placeholder.svg'} alt={record.books?.title} className="w-16 h-24 object-cover rounded shadow" />
                        <div>
                          <div className="font-semibold text-lg text-blue-900">{record.books?.title}</div>
                          <div className="text-sm text-blue-700">{record.books?.author}</div>
                          <div className="text-xs text-muted-foreground mt-1">Borrowed by: <span className="font-semibold">{record.students?.name}</span> ({record.students?.student_id})</div>
                          <div className="text-xs text-muted-foreground">Borrowed: {new Date(record.borrowed_at).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">Due: {new Date(record.due_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <button
                        className="mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
                        onClick={() => handleApproveReturn(record)}
                      >
                        Approve Return
                      </button>
                    </div>
                  ))}
                </div>
                {/* Pagination Controls for Return Requests */}
                {returnRequestsTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                      className="px-3 py-1 rounded bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
                      onClick={() => setReturnRequestsPage(p => Math.max(1, p - 1))}
                      disabled={returnRequestsPage === 1}
                    >
                      Previous
                    </button>
                    {Array.from({ length: returnRequestsTotalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`px-3 py-1 rounded ${returnRequestsPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                        onClick={() => setReturnRequestsPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="px-3 py-1 rounded bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
                      onClick={() => setReturnRequestsPage(p => Math.min(returnRequestsTotalPages, p + 1))}
                      disabled={returnRequestsPage === returnRequestsTotalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Currently Borrowed Books Section */}
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">Currently Borrowed Books</h2>
            {loading ? <div>Loading...</div> : borrowedBooks.length === 0 ? (
              <div className="text-muted-foreground">No currently borrowed books.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {borrowedBooks.map(record => (
                  <div key={record.id} className="bg-indigo-50 border-l-4 border-indigo-400 rounded-xl p-4 flex flex-col shadow">
                    <div className="flex items-center gap-4 mb-2">
                      <img src={record.books?.cover_url || '/placeholder.svg'} alt={record.books?.title} className="w-16 h-24 object-cover rounded shadow" />
                      <div>
                        <div className="font-semibold text-lg text-indigo-900">{record.books?.title}</div>
                        <div className="text-sm text-indigo-700">{record.books?.author}</div>
                        <div className="text-xs text-muted-foreground mt-1">Borrowed by: <span className="font-semibold">{record.students?.name}</span> ({record.students?.student_id})</div>
                        <div className="text-xs text-muted-foreground">Borrowed: {new Date(record.borrowed_at).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">Due: {new Date(record.due_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overdue Books Section */}
          {overdue.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 mb-8">
              <h2 className="text-lg font-semibold text-red-700 mb-2">Overdue Books</h2>
              <ul className="space-y-1">
                {overdue.map(r => (
                  <li key={r.id} className="text-red-900 text-sm">
                    {r.students?.name} ({r.students?.student_id}) - <strong>{r.books?.title}</strong> (Due: {r.due_at && new Date(r.due_at).toLocaleDateString()})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* All Borrow Records Table */}
          <div className="bg-card rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">All Borrow Records</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Book</th>
                    <th className="px-4 py-2 text-left">Borrowed At</th>
                    <th className="px-4 py-2 text-left">Due At</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Returned At</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map(r => (
                    <tr key={r.id} className={r.due_at && !r.returned_at && new Date(r.due_at) < new Date() ? 'bg-red-50' : ''}>
                      <td className="px-4 py-2">{r.students?.name} ({r.students?.student_id})</td>
                      <td className="px-4 py-2">{r.books?.title} {r.books?.author && `by ${r.books.author}`}</td>
                      <td className="px-4 py-2">{r.borrowed_at && new Date(r.borrowed_at).toLocaleString()}</td>
                      <td className="px-4 py-2">{r.due_at && new Date(r.due_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{r.status.replace('_', ' ')}</td>
                      <td className="px-4 py-2">{r.returned_at ? new Date(r.returned_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  className="px-3 py-1 rounded bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1 rounded bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <LibraryFooter />
    </div>
  );
};

const App = () => {
  const [role, setRole] = useState<string | null>(null);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setRole(null);
        setRoleChecked(true);
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
        setRoleChecked(true);
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
        setRoleChecked(true);
        return;
      }
      setRole(null);
      setRoleChecked(true);
    };
    fetchRole();
  }, []);

  if (!roleChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <div className="text-lg text-muted-foreground">Verifying your account, please wait...</div>
        </div>
      </div>
    );
  }

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/digital-resources" element={<DigitalResources />} />
          <Route path="/account" element={<Account />} />
          <Route path="/about" element={<About />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/schedule-demo" element={<ScheduleDemo />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/staff-dashboard" element={<StaffDashboard role={role} />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/search" element={<SearchResults />} />
            <Route path="/StaffLanding" element={<StaffLanding />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
};

export default App;
