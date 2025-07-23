import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useNavigate, Link } from "react-router-dom";
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
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import { loadStripe } from '@stripe/stripe-js';

const queryClient = new QueryClient();

// ErrorBoundary for 3D Canvas
type CanvasErrorBoundaryState = { hasError: boolean };
class CanvasErrorBoundary extends React.Component<React.PropsWithChildren<object>, CanvasErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true };
  }
  componentDidCatch(error: unknown, errorInfo: unknown) {
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
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    console.log("[SignIn] signInWithPassword result:", { error, data });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // Get user role by checking students and staff tables
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("[SignIn] Fetched user after sign-in:", user, "Error:", userError);
      
      if (!user) {
        setError('User not found');
        return;
      }

      // Check students table
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('email', user.email)
        .single();
      console.log("[SignIn] Student table lookup:", student, "Error:", studentError);
      
      if (student) {
        console.log("[SignIn] User is a student, navigating to homepage");
        navigate('/');
        return;
      }

      // Check staff table
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('email', user.email)
        .single();
      console.log("[SignIn] Staff table lookup:", staff, "Error:", staffError);
      
      if (staff) {
        console.log("[SignIn] User is staff, navigating to account");
        navigate('/account');
        return;
      }

      // If user exists in neither table
      console.log("[SignIn] User not found in students or staff table, navigating to home");
      navigate('/');
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

  // Defensive 3D Canvas rendering
  const render3DBackground = () => {
    try {
  return (
      <CanvasErrorBoundary>
        <div className="absolute inset-0 z-0 pointer-events-none">
            <React.Suspense fallback={null}>
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
            </React.Suspense>
        </div>
      </CanvasErrorBoundary>
      );
    } catch (e) {
      console.error("3D Canvas rendering error:", e);
      return null;
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-accent/10 overflow-hidden">
      {/* 3D Animated Background with Error Boundary */}
      {render3DBackground()}
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
  const navigate = useNavigate();
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
            onClick={() => navigate('/signin')}
          >
            Join Now
          </button>
        </div>
      </main>
      <LibraryFooter />
    </div>
  );
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check URL hash first (Supabase default method)
    const hash = window.location.hash;
    let match = hash.match(/access_token=([^&]+)/);
    
    // If not in hash, check query parameters (alternative method)
    if (!match) {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('access_token');
      if (token) {
        setToken(token);
        setHasToken(true);
        authenticateWithToken(token);
        return;
      }
    }
    
    // If found in hash
    if (match) {
      const accessToken = match[1];
      setToken(accessToken);
      setHasToken(true);
      authenticateWithToken(accessToken);
    } else {
      setHasToken(false);
    }
  }, []);

  const authenticateWithToken = async (accessToken: string) => {
    try {
      console.log('[ResetPassword] Attempting to authenticate with token:', accessToken);
      
      // Use verifyOtp with recovery type and token_hash
      const { error } = await supabase.auth.verifyOtp({
        token_hash: accessToken,
        type: 'recovery'
      });
      
      if (error) {
        console.error('Authentication error:', error);
        setError('Invalid or expired reset link. Please request a new one.');
        setHasToken(false);
      } else {
        console.log('[ResetPassword] Authentication successful');
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      setError('Failed to authenticate. Please try again.');
      setHasToken(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    
    if (!isAuthenticated) {
      setError('Please wait while we authenticate your session...');
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
        navigate('/signin');
      }, 2000);
    }
  };

  // If no token found, show a helpful message
  if (!hasToken) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-accent/10">
        <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col items-center backdrop-blur-md border border-blue-100">
          <div className="flex flex-col items-center mb-6">
            <img src="/kl-university-logo.svg" alt="KL University Logo" className="h-14 mb-2" />
            <h1 className="text-3xl font-bold text-primary mb-1">Reset Password</h1>
            <p className="text-muted-foreground text-base text-center">Invalid or missing reset link</p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="text-red-600 text-sm font-medium">
              No access token found. Please use the link from your email.
            </div>
            <p className="text-sm text-muted-foreground">
              If you clicked a link from your email and are seeing this message, the link may have expired or is invalid.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="w-full py-3 rounded-lg bg-primary text-white font-semibold text-lg shadow-md hover:bg-primary/90 transition-bounce"
            >
              Back to Sign In
        </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-accent/10">
      <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col items-center backdrop-blur-md border border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <img src="/kl-university-logo.svg" alt="KL University Logo" className="h-14 mb-2" />
          <h1 className="text-3xl font-bold text-primary mb-1">Reset Password</h1>
          <p className="text-muted-foreground text-base">
            {isAuthenticated ? 'Enter your new password' : 'Authenticating...'}
          </p>
        </div>
        
        <form onSubmit={handleReset} className="w-full space-y-5">
          <div>
            <label className="block mb-1 font-medium text-primary">New Password</label>
            <Input 
              type="password" 
              placeholder="Enter your new password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              autoFocus 
              disabled={!isAuthenticated}
            />
          </div>
          
          {error && <div className="text-red-600 text-sm text-center font-medium">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center font-medium">Password updated! Redirecting to sign in...</div>}
          
          <button 
            type="submit" 
            disabled={loading || !isAuthenticated} 
            className="w-full py-3 rounded-lg bg-primary text-white font-semibold text-lg shadow-md hover:bg-primary/90 transition-bounce disabled:opacity-60"
          >
            {loading ? 'Resetting...' : !isAuthenticated ? 'Authenticating...' : 'Reset Password'}
          </button>
      </form>
      </div>
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

// Add fine calculation utility
const calculateFine = (dueDate: string, returnedDate?: string): number => {
  const due = new Date(dueDate);
  const returned = returnedDate ? new Date(returnedDate) : new Date();
  const daysOverdue = Math.floor((returned.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysOverdue) * 0.50; // $0.50 per day
};

const StudentDashboard = () => {
  console.log("[StudentDashboard] Rendered");
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendedBook[]>([]);
  const [totalFines, setTotalFines] = useState(0);
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
      
      // Calculate total fines
      const fines = (borrowData || []).reduce((total, record) => {
        if (record.due_at && !record.returned_at) {
          return total + calculateFine(record.due_at);
        }
        return total;
      }, 0);
      setTotalFines(fines);
      
      // Improved recommendation system
      try {
        console.log("[Recommendations] Starting recommendation fetch...");
        
        // Get all books from the library
        const { data: allBooks } = await supabase
          .from('books')
          .select('id, title, author, category, available_copies')
          .gt('available_copies', 0); // Only recommend available books
        
        console.log("[Recommendations] All books fetched:", allBooks?.length || 0);
        
        if (allBooks && allBooks.length > 0) {
          // Get books this student has borrowed (to exclude them)
      const borrowedBookIds = (borrowData || []).map((r: any) => r.books?.id).filter(Boolean);
          console.log("[Recommendations] Student borrowed book IDs:", borrowedBookIds);
          
          // Get popular books (most borrowed overall)
          const { data: popularBooks } = await supabase
        .from('borrow_records')
            .select('book_id, books(id, title, author, category)')
            .not('book_id', 'is', null);
          
          console.log("[Recommendations] Popular books fetched:", popularBooks?.length || 0);
          
          // Count popularity of each book
          const bookPopularity: Record<string, { id: string; title: string; author?: string; category?: string; count: number }> = {};
          
          (popularBooks || []).forEach((record: any) => {
            let book = record.books;
        if (Array.isArray(book)) {
          book = book[0];
        }
            if (book && book.id) {
              if (!bookPopularity[book.id]) {
                bookPopularity[book.id] = {
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  category: book.category,
                  count: 0
                };
              }
              bookPopularity[book.id].count++;
            }
          });
          
          console.log("[Recommendations] Book popularity calculated:", Object.keys(bookPopularity).length);
          
          // Filter out books the student has already borrowed
          const availableBooks = allBooks.filter(book => !borrowedBookIds.includes(book.id));
          console.log("[Recommendations] Available books (not borrowed):", availableBooks.length);
          
          // Create recommendations based on popularity and availability
          const recommendations: RecommendedBook[] = [];
          
          // Add popular books first
          Object.values(bookPopularity)
            .filter(book => !borrowedBookIds.includes(book.id))
        .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .forEach(book => {
              recommendations.push({
                id: book.id,
                title: book.title,
                author: book.author,
                count: book.count
              });
            });
          
          console.log("[Recommendations] Popular books added:", recommendations.length);
          
          // Add some random available books to fill up to 5 recommendations
          const remainingBooks = availableBooks.filter(book => 
            !recommendations.find(rec => rec.id === book.id)
          );
          
          // Shuffle and take up to 2 more books
          const shuffled = remainingBooks.sort(() => 0.5 - Math.random());
          shuffled.slice(0, 5 - recommendations.length).forEach(book => {
            recommendations.push({
              id: book.id,
              title: book.title,
              author: book.author,
              count: 0 // New books have 0 borrows
            });
          });
          
          console.log("[Recommendations] Final recommendations:", recommendations);
          setRecommendations(recommendations);
        } else {
          console.log("[Recommendations] No books available, using fallback");
          // Fallback: if no books available, show some sample recommendations
          setRecommendations([
            { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', count: 15 },
            { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', count: 12 },
            { id: '3', title: '1984', author: 'George Orwell', count: 10 },
            { id: '4', title: 'Pride and Prejudice', author: 'Jane Austen', count: 8 },
            { id: '5', title: 'The Catcher in the Rye', author: 'J.D. Salinger', count: 7 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback recommendations
        setRecommendations([
          { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', count: 15 },
          { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', count: 12 },
          { id: '3', title: '1984', author: 'George Orwell', count: 10 }
        ]);
      }
      
      setLoading(false);
    };
    fetchUserAndRecords();
  }, [navigate]);

  if (!user) {
    console.log("[StudentDashboard] No user, returning null");
    return <div style={{color: 'red', fontWeight: 'bold'}}>No user found. (StudentDashboard)</div>;
  }

  return (
    <div style={{padding: 40}}>
      <h1>My Borrowed Books</h1>
      
      {/* Fines Section */}
      {totalFines > 0 && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{color: '#dc2626', margin: '0 0 8px 0'}}>⚠️ Outstanding Fines</h3>
            <p style={{color: '#7f1d1d', margin: '0'}}>You have overdue books with fines totaling: <strong>${totalFines.toFixed(2)}</strong></p>
          </div>
          <button
            onClick={() => navigate('/pay-fines')}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Pay Fines
          </button>
        </div>
      )}
      
      {recommendations.length > 0 && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📚 Recommended for you
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {recommendations.map(b => (
              <div key={b.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '4px'
                  }}>
                    {b.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    marginBottom: '8px'
                  }}>
                    {b.author || 'Unknown Author'}
                  </p>
                  <span style={{
                    fontSize: '12px',
                    color: '#059669',
                    backgroundColor: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    {b.count} borrows
                  </span>
                </div>
                <button style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }} onClick={() => {
                  // TODO: Implement borrow functionality
                  alert(`Borrow request for "${b.title}" will be implemented soon!`);
                }}>
                  Borrow
                </button>
              </div>
            ))}
          </div>
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
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => {
              const fine = r.due_at && !r.returned_at ? calculateFine(r.due_at) : 0;
              const isOverdue = r.due_at && !r.returned_at && new Date(r.due_at) < new Date();
              
              return (
                <tr key={r.id} style={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: isOverdue ? '#fef2f2' : 'transparent'
                }}>
                <td>{r.books?.title} {r.books?.author && `by ${r.books.author}`}</td>
                <td>{r.borrowed_at && new Date(r.borrowed_at).toLocaleString()}</td>
                <td>{r.due_at && new Date(r.due_at).toLocaleDateString()}</td>
                <td>{r.status}</td>
                <td>{r.returned_at ? new Date(r.returned_at).toLocaleString() : '-'}</td>
                  <td style={{color: fine > 0 ? '#dc2626' : 'inherit'}}>
                    {fine > 0 ? `$${fine.toFixed(2)}` : '-'}
                  </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Add type for analytics stats
interface MostBorrowedBook {
  id: string;
  title: string;
  count: number;
}
interface AnalyticsStats {
  totalBooks: number;
  totalUsers: number;
  mostBorrowed: MostBorrowedBook[];
  overdueCount: number;
  borrowTrends: { month: string; count: number }[];
  borrowsByCategory: { category: string; count: number }[];
  activeBorrowsByCategory: { category: string; count: number }[];
  overdueByCategory: { category: string; count: number }[];
  categoryTrends: { category: string; data: { month: string; count: number }[] }[];
  topStudentsByCategory: { category: string; students: { id: string; name: string; count: number }[] }[];
  categories: string[];
  borrowRecords: any[];
}

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
  const [allRecordsStudentId, setAllRecordsStudentId] = useState("");
  const [borrowedBooksStudentId, setBorrowedBooksStudentId] = useState("");
  const [returnRequestsStudentId, setReturnRequestsStudentId] = useState("");

  // Filtered data for each section
  const filteredReturnRequests = returnRequestsStudentId.trim()
    ? returnRequests.filter(r => r.students?.student_id?.toLowerCase().includes(returnRequestsStudentId.trim().toLowerCase()))
    : returnRequests;
  const filteredBorrowedBooks = borrowedBooksStudentId.trim()
    ? borrowedBooks.filter(r => r.students?.student_id?.toLowerCase().includes(borrowedBooksStudentId.trim().toLowerCase()))
    : borrowedBooks;
  const filteredAllRecords = allRecordsStudentId.trim()
    ? requests.filter(r => r.students?.student_id?.toLowerCase().includes(allRecordsStudentId.trim().toLowerCase()))
    : requests;

  const paginatedRequests = filteredAllRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Pagination for return requests (filtered only)
  const [returnRequestsPage, setReturnRequestsPage] = useState(1);
  const returnRequestsPageSize = 10;
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
            {/* Search by Student ID for Return Requests */}
            <div className="mb-4 max-w-xs">
              <Input
                placeholder="Search by Student ID (Return Requests)..."
                value={returnRequestsStudentId}
                onChange={e => setReturnRequestsStudentId(e.target.value)}
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
            {/* Search by Student ID for Currently Borrowed Books */}
            <div className="mb-4 max-w-xs">
              <Input
                placeholder="Search by Student ID (Borrowed Books)..."
                value={borrowedBooksStudentId}
                onChange={e => setBorrowedBooksStudentId(e.target.value)}
                className=""
              />
            </div>
            {loading ? <div>Loading...</div> : filteredBorrowedBooks.length === 0 ? (
              <div className="text-muted-foreground">No currently borrowed books.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBorrowedBooks.map(record => (
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
            {/* Search by Student ID for All Borrow Records */}
            <div className="mb-4 max-w-xs">
              <Input
                placeholder="Search by Student ID (All Records)..."
                value={allRecordsStudentId}
                onChange={e => setAllRecordsStudentId(e.target.value)}
                className=""
              />
            </div>
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

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }
      }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-accent/10">
      <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col items-center backdrop-blur-md border border-blue-100">
        <h1 className="text-3xl font-bold text-primary mb-1">Sign Up</h1>
        <p className="text-muted-foreground text-base mb-6">Create your KL SmartLibrary account</p>
        <form onSubmit={handleSignUp} className="w-full space-y-5">
          <div>
            <label className="block mb-1 font-medium text-primary">Email</label>
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="block mb-1 font-medium text-primary">Password</label>
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-medium text-primary">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-sm text-center font-medium mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center font-medium mt-2">Account created! Redirecting to sign in...</div>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-primary text-white font-semibold text-lg shadow-md hover:bg-primary/90 transition-bounce disabled:opacity-60 mt-2">
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-sm text-center">
          Already have an account? <Link to="/signin" className="text-blue-600 hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [role, setRole] = useState<string | null>(null);
  const [roleChecked, setRoleChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      // Only log unexpected errors
      if (authError && authError.name !== 'AuthSessionMissingError') {
        console.error("[App] Unexpected auth error:", authError);
      }
      if (!authData.user) {
        setRole(null);
        setRoleChecked(true);
        return;
      }
      // Check students table
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('email', authData.user.email)
        .single();
      console.log("[App] Student table lookup:", student, "Error:", studentError);
      if (student) {
        setRole('student');
        setRoleChecked(true);
        return;
      }
      // Check staff table
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('email', authData.user.email)
        .single();
      console.log("[App] Staff table lookup:", staff, "Error:", staffError);
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
    console.log("[App] Waiting for role check. role:", role, "roleChecked:", roleChecked);
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

  console.log("[App] Rendering main app. role:", role, "roleChecked:", roleChecked);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Removed <BrowserRouter> wrapper here, as it should only be in main.tsx */}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/digital-resources" element={<DigitalResources />} />
        <Route path="/account" element={<Account />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/get-started" element={<GetStarted />} />

        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/staff-dashboard" element={<StaffDashboard role={role} />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/StaffLanding" element={<StaffLanding />} />

        {/* Oversee Borrow Requests route */}
        <Route path="/oversee-borrow-requests" element={<OverseeBorrowRequests />} />
        <Route path="/analytics" element={<Analytics />} />
        {/* Payment Gateway route */}
        <Route path="/pay-fines" element={<PayFines />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);
};

// Oversee Borrow Requests Page
const OverseeBorrowRequests = () => {
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const pageSize = 8;
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('borrow_records')
        .select('id, student_id, students(name, student_id), book_id, books(title, author), borrowed_at, due_at, status, returned_at')
        .order('borrowed_at', { ascending: false });
      setRecords(data || []);
      setLoading(false);
    };
    fetchRecords();
  }, []);

  // Reset to first page when filter changes
  React.useEffect(() => { setPage(1); }, [filter, statusFilter]);

  const handleApprove = async (id) => {
    await supabase.from('borrow_records').update({ status: 'approved' }).eq('id', id);
    setRecords(recs => recs.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };
  const handleReject = async (id) => {
    await supabase.from('borrow_records').update({ status: 'rejected' }).eq('id', id);
    setRecords(recs => recs.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  const filteredRecords = records.filter(r =>
    (filter.trim() === '' || r.students?.student_id?.toLowerCase().includes(filter.trim().toLowerCase())) &&
    (statusFilter === 'all' || r.status === statusFilter)
  );

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LibraryNavbar />
      <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-12 flex-1 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-primary">Oversee Borrow Requests</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
          <input
            className="border rounded px-2 py-2 text-sm sm:text-base w-full max-w-xs"
            placeholder="Filter by Student ID..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <select
            className="border rounded px-2 py-2 text-sm sm:text-base w-full max-w-xs"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="borrowed">Borrowed</option>
            <option value="returned">Returned</option>
            <option value="return_requested">Return Requested</option>
          </select>
        </div>
        {loading ? <div>Loading...</div> : (
          <>
          <div className="w-full overflow-x-auto rounded-lg border bg-white/80 shadow-sm">
            <table className="min-w-[700px] w-full text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="px-2 sm:px-4 py-2 border">ID</th>
                  <th className="px-2 sm:px-4 py-2 border">Student</th>
                  <th className="px-2 sm:px-4 py-2 border">Book</th>
                  <th className="px-2 sm:px-4 py-2 border">Borrowed At</th>
                  <th className="px-2 sm:px-4 py-2 border">Due At</th>
                  <th className="px-2 sm:px-4 py-2 border">Status</th>
                  <th className="px-2 sm:px-4 py-2 border">Returned At</th>
                  <th className="px-2 sm:px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-4">No borrow requests found.</td></tr>
                ) : paginatedRecords.map(r => (
                  <tr key={r.id}>
                    <td className="px-2 sm:px-4 py-2 border break-all">{r.id}</td>
                    <td className="px-2 sm:px-4 py-2 border">{r.students?.name} <span className="block sm:inline">({r.students?.student_id})</span></td>
                    <td className="px-2 sm:px-4 py-2 border">{r.books?.title} {r.books?.author && <span className="block sm:inline">by {r.books.author}</span>}</td>
                    <td className="px-2 sm:px-4 py-2 border">{r.borrowed_at && new Date(r.borrowed_at).toLocaleString()}</td>
                    <td className="px-2 sm:px-4 py-2 border">{r.due_at && new Date(r.due_at).toLocaleDateString()}</td>
                    <td className="px-2 sm:px-4 py-2 border capitalize">{r.status.replace('_', ' ')}</td>
                    <td className="px-2 sm:px-4 py-2 border">{r.returned_at ? new Date(r.returned_at).toLocaleString() : '-'}</td>
                    <td className="px-2 sm:px-4 py-2 border">
                      {r.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button className="bg-green-600 text-white px-2 py-1 rounded text-xs sm:text-sm" onClick={() => handleApprove(r.id)}>Approve</button>
                          <button className="bg-red-600 text-white px-2 py-1 rounded text-xs sm:text-sm" onClick={() => handleReject(r.id)}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
              <button
                className="px-3 py-1 rounded bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-500 text-white' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
          </>
        )}
      </main>
      <LibraryFooter />
    </div>
  );
};

// Analytics Page
const Analytics = () => {
  const [stats, setStats] = React.useState<AnalyticsStats>({
    totalBooks: 0,
    totalUsers: 0,
    mostBorrowed: [],
    overdueCount: 0,
    borrowTrends: [],
    borrowsByCategory: [],
    activeBorrowsByCategory: [],
    overdueByCategory: [],
    categoryTrends: [],
    topStudentsByCategory: [],
    categories: [],
    borrowRecords: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [showPercentage, setShowPercentage] = React.useState(false);
  // Add state for student ID filter
  const [tableStudentId, setTableStudentId] = React.useState("");
  const navigate = useNavigate();
  // Modal state for analytics
  const [analyticsModal, setAnalyticsModal] = React.useState<null | 'books' | 'students' | 'borrows' | 'overdue'>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      // Fetch all categories
      const { data: booksData } = await supabase.from('books').select('id, category, title');
      const categories = Array.from(new Set((booksData || []).map(b => b.category).filter(Boolean)));
      // Total books
      const { count: totalBooks } = await supabase.from('books').select('*', { count: 'exact', head: true });
      // Total users
      const { count: totalUsers } = await supabase.from('students').select('*', { count: 'exact', head: true });
      // All borrow records with join to books and students
      const { data: borrowRecords } = await supabase
        .from('borrow_records')
        .select('id, book_id, student_id, borrowed_at, due_at, returned_at, status, books(id, title, category), students(id, name, student_id)');
      // Filter by category if selected
      const filteredRecords = selectedCategory
        ? (borrowRecords || []).filter(r => {
            const book = Array.isArray(r.books) ? r.books[0] : r.books;
            return book && book.category === selectedCategory;
          })
        : (borrowRecords || []);
      // Most borrowed books
      const bookCount: Record<string, { title: string; count: number }> = {};
      filteredRecords.forEach(r => {
        if (!r.book_id) return;
        const book = Array.isArray(r.books) ? r.books[0] : r.books;
        const bookTitle = book?.title || 'Unknown';
        if (!bookCount[r.book_id]) bookCount[r.book_id] = { title: bookTitle, count: 0 };
        bookCount[r.book_id].count++;
      });
      const mostBorrowed = Object.entries(bookCount)
        .map(([id, v]) => ({ id, title: v.title, count: v.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      // Overdue count
      const now = new Date();
      const overdueCount = filteredRecords.filter(r => r.due_at && !r.returned_at && new Date(r.due_at) < now).length;
      // Borrow trends (by month)
      const trends: Record<string, number> = {};
      filteredRecords.forEach(r => {
        if (!r.borrowed_at) return;
        const d = new Date(r.borrowed_at);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        if (!trends[key]) trends[key] = 0;
        trends[key]++;
      });
      const borrowTrends = Object.entries(trends).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month));
      // Borrows by category (pie)
      const borrowsByCategory: Record<string, number> = {};
      filteredRecords.forEach(r => {
        const book = Array.isArray(r.books) ? r.books[0] : r.books;
        const cat = book?.category || 'Unknown';
        if (!borrowsByCategory[cat]) borrowsByCategory[cat] = 0;
        borrowsByCategory[cat]++;
      });
      const borrowsByCategoryArr = Object.entries(borrowsByCategory).map(([category, count]) => ({ category, count }));
      // Active borrows by category
      const activeBorrowsByCategory: Record<string, number> = {};
      filteredRecords.forEach(r => {
        if (r.returned_at) return;
        const book = Array.isArray(r.books) ? r.books[0] : r.books;
        const cat = book?.category || 'Unknown';
        if (!activeBorrowsByCategory[cat]) activeBorrowsByCategory[cat] = 0;
        activeBorrowsByCategory[cat]++;
      });
      const activeBorrowsByCategoryArr = Object.entries(activeBorrowsByCategory).map(([category, count]) => ({ category, count }));
      // Overdue by category
      const overdueByCategory: Record<string, number> = {};
      filteredRecords.forEach(r => {
        if (r.due_at && !r.returned_at && new Date(r.due_at) < now) {
          const book = Array.isArray(r.books) ? r.books[0] : r.books;
          const cat = book?.category || 'Unknown';
          if (!overdueByCategory[cat]) overdueByCategory[cat] = 0;
          overdueByCategory[cat]++;
        }
      });
      const overdueByCategoryArr = Object.entries(overdueByCategory).map(([category, count]) => ({ category, count }));
      // Category trends over time
      const categoryTrends: Record<string, Record<string, number>> = {};
      filteredRecords.forEach(r => {
        if (!r.borrowed_at) return;
        const d = new Date(r.borrowed_at);
        const month = `${d.getFullYear()}-${d.getMonth() + 1}`;
        const book = Array.isArray(r.books) ? r.books[0] : r.books;
        const cat = book?.category || 'Unknown';
        if (!categoryTrends[cat]) categoryTrends[cat] = {};
        if (!categoryTrends[cat][month]) categoryTrends[cat][month] = 0;
        categoryTrends[cat][month]++;
      });
      const categoryTrendsArr = Object.entries(categoryTrends).map(([category, months]) => ({
        category,
        data: Object.entries(months).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month)),
      }));
      // Top students per category
      const studentCatCount: Record<string, Record<string, { name: string; count: number }>> = {};
      filteredRecords.forEach(r => {
        const book = Array.isArray(r.books) ? r.books[0] : r.books;
        const cat = book?.category || 'Unknown';
        const student = Array.isArray(r.students) ? r.students[0] : r.students;
        const studentId = student?.id;
        const studentName = student?.name || 'Unknown';
        if (!studentId) return;
        if (!studentCatCount[cat]) studentCatCount[cat] = {};
        if (!studentCatCount[cat][studentId]) studentCatCount[cat][studentId] = { name: studentName, count: 0 };
        studentCatCount[cat][studentId].count++;
      });
      const topStudentsByCategory = Object.entries(studentCatCount).map(([category, students]) => ({
        category,
        students: Object.entries(students)
          .map(([id, v]) => ({ id, name: v.name, count: v.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3),
      }));
      setStats({
        totalBooks,
        totalUsers,
        mostBorrowed,
        overdueCount,
        borrowTrends,
        borrowsByCategory: borrowsByCategoryArr,
        activeBorrowsByCategory: activeBorrowsByCategoryArr,
        overdueByCategory: overdueByCategoryArr,
        categoryTrends: categoryTrendsArr,
        topStudentsByCategory,
        categories,
        borrowRecords: filteredRecords,
      });
      setLoading(false);
    };
    fetchStats();
  }, [selectedCategory]);

  const COLORS = ['#2563eb', '#fbbf24', '#f59e42', '#10b981', '#ef4444', '#6366f1', '#a21caf', '#eab308', '#0ea5e9', '#14b8a6'];

  const tableRecords = tableStudentId
    ? stats.borrowRecords.filter(r =>
        r.students &&
        typeof r.students.student_id === 'string' &&
        r.students.student_id.includes(tableStudentId.trim())
      )
    : stats.borrowRecords.filter(r =>
        !selectedCategory || (r.books && r.books.category === selectedCategory)
      );

  // Add state for pagination
  const [borrowRecordsPage, setBorrowRecordsPage] = React.useState(1);
  const borrowRecordsPageSize = 10;
  const paginatedTableRecords = tableRecords.slice((borrowRecordsPage - 1) * borrowRecordsPageSize, borrowRecordsPage * borrowRecordsPageSize);
  const borrowRecordsTotalPages = Math.ceil(tableRecords.length / borrowRecordsPageSize);

  // Simple Modal component
  function AnalyticsModal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-gray-700">&times;</button>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <div>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LibraryNavbar />
      <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-12 flex-1 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-primary">Library Analytics</h1>
        {loading ? <div>Loading...</div> : (
          <>
            {/* Toggle for count/percentage */}
            <div className="mb-2 flex items-center gap-3">
              <span className="font-medium">Show:</span>
              <button
                className={`px-3 py-1 rounded ${!showPercentage ? 'bg-blue-500 text-white' : 'bg-muted text-foreground'}`}
                onClick={() => setShowPercentage(false)}
              >
                Count
              </button>
              <button
                className={`px-3 py-1 rounded ${showPercentage ? 'bg-blue-500 text-white' : 'bg-muted text-foreground'}`}
                onClick={() => setShowPercentage(true)}
              >
                Percentage
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Pie Chart: Borrows by Category */}
              <div className="bg-card rounded-xl shadow p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-2">Borrows by Category</h2>
                <PieChart width={380} height={280}>
                  <Pie
                    data={stats.borrowsByCategory}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      const entry = stats.borrowsByCategory[index];
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#222"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize={15}
                          fontWeight={500}
                        >
                          {showPercentage
                            ? `${(percent * 100).toFixed(0)}%`
                            : entry.count}
                        </text>
                      );
                    }}
                  >
                    {stats.borrowsByCategory.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend layout="horizontal" verticalAlign="bottom" align="center"/>
                  <RechartsTooltip contentStyle={{ background: '#fff', border: 'none', boxShadow: 'none' }} />
                </PieChart>
              </div>
              {/* Bar Chart: Top Categories */}
              <div className="bg-card rounded-xl shadow p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-2">Top Categories by Borrow Count</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={stats.borrowsByCategory.sort((a, b) => b.count - a.count).slice(0, 10)}
                      style={{
                        '.recharts-bar-rectangle:hover': {
                          fill: 'inherit !important',
                          opacity: '1 !important'
                        }
                      }}
                    >
                    <XAxis dataKey="category" />
                      <YAxis />
                      <RechartsTooltip contentStyle={{ background: '#fff', border: 'none', boxShadow: 'none' }} />
                      <Bar dataKey="count" fill="#8884d8" style={{ cursor: 'pointer' }}>
                        {stats.borrowsByCategory.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#00ffff', '#ffff00'][index % 10]}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </div>
              {/* Bar Chart: Active Borrows by Category */}
              <div className="bg-card rounded-xl shadow p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-2">Active Borrows by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.activeBorrowsByCategory}>
                    <XAxis dataKey="category" />
                    <YAxis allowDecimals={false} />
                    <Bar dataKey="count" fill="#10b981" />
                    <RechartsTooltip contentStyle={{ background: '#fff', border: 'none', boxShadow: 'none' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Bar Chart: Overdue by Category */}
              <div className="bg-card rounded-xl shadow p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-2">Overdue Borrows by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.overdueByCategory}>
                    <XAxis dataKey="category" />
                    <YAxis allowDecimals={false} />
                    <Bar dataKey="count" fill="#ef4444" />
                    <RechartsTooltip contentStyle={{ background: '#fff', border: 'none', boxShadow: 'none' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Line Chart: Category Trends Over Time */}
              <div className="bg-card rounded-xl shadow p-4 sm:p-6 md:col-span-2">
                <h2 className="text-base sm:text-lg font-semibold mb-2">Category Trends Over Time</h2>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={mergeCategoryTrends(stats.categoryTrends, selectedCategory)}>
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    {getCategoryKeys(stats.categoryTrends, selectedCategory).map((cat, idx) => (
                      <Bar key={cat} dataKey={cat} fill={COLORS[idx % COLORS.length]} />
                    ))}
                    <RechartsTooltip contentStyle={{ background: '#fff', border: 'none', boxShadow: 'none' }} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Filter Borrow Records by Category */}
            <div className="bg-card rounded-xl shadow p-4 sm:p-6 mt-8">
              <h2 className="text-base sm:text-lg font-semibold mb-2">Filter Borrow Records by Category</h2>
              <div className="mb-4 flex flex-wrap gap-2 items-center">
                <button className={`px-3 py-1 rounded ${!selectedCategory ? 'bg-blue-500 text-white' : 'bg-muted text-foreground'}`} onClick={() => setSelectedCategory(null)}>All</button>
                {stats.categories.map(cat => (
                  <button key={cat} className={`px-3 py-1 rounded ${selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-muted text-foreground'}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
                ))}
                <input
                  type="text"
                  placeholder="Search by Student ID No..."
                  value={tableStudentId}
                  onChange={e => setTableStudentId(e.target.value)}
                  className="ml-4 px-3 py-1 rounded border border-muted-foreground/30 focus:border-blue-500 outline-none"
                  style={{ minWidth: 180 }}
                />
              </div>
            </div>
            {/* Borrow Records Table with Category Filter */}
            <div className="bg-card rounded-xl shadow p-4 sm:p-6 mt-8">
              <h2 className="text-base sm:text-lg font-semibold mb-2">Borrow Records{selectedCategory ? ` (${selectedCategory})` : ''}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 border">ID</th>
                      <th className="px-2 py-2 border">Student</th>
                      <th className="px-2 py-2 border">Book</th>
                      <th className="px-2 py-2 border">Category</th>
                      <th className="px-2 py-2 border">Borrowed At</th>
                      <th className="px-2 py-2 border">Due At</th>
                      <th className="px-2 py-2 border">Status</th>
                      <th className="px-2 py-2 border">Returned At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTableRecords.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-4">No records found.</td></tr>
                    ) : paginatedTableRecords.map(r => (
                      <tr key={r.id}>
                        <td className="px-2 py-2 border break-all">{r.id}</td>
                        <td className="px-2 py-2 border">{r.students?.name} <span className="block sm:inline">({r.students?.student_id})</span></td>
                        <td className="px-2 py-2 border">{r.books?.title}</td>
                        <td className="px-2 py-2 border">{r.books?.category}</td>
                        <td className="px-2 py-2 border">{r.borrowed_at && new Date(r.borrowed_at).toLocaleString()}</td>
                        <td className="px-2 py-2 border">{r.due_at && new Date(r.due_at).toLocaleDateString()}</td>
                        <td className="px-2 py-2 border capitalize">{r.status.replace('_', ' ')}</td>
                        <td className="px-2 py-2 border">{r.returned_at ? new Date(r.returned_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {borrowRecordsTotalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
                  <button
                    className="px-3 py-1 rounded bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
                    onClick={() => setBorrowRecordsPage(p => Math.max(1, p - 1))}
                    disabled={borrowRecordsPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: borrowRecordsTotalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`px-3 py-1 rounded ${borrowRecordsPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-muted text-foreground hover:bg-muted/80'}`}
                      onClick={() => setBorrowRecordsPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 rounded bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50"
                    onClick={() => setBorrowRecordsPage(p => Math.min(borrowRecordsTotalPages, p + 1))}
                    disabled={borrowRecordsPage === borrowRecordsTotalPages}
                  >
                    Next
                  </button>
            </div>
              )}
            </div>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition" onClick={() => setAnalyticsModal('books')}>
                <div className="text-2xl font-bold text-blue-600">{stats.totalBooks || 0}</div>
                <div className="text-sm text-blue-700">Total Books</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition" onClick={() => setAnalyticsModal('students')}>
                <div className="text-2xl font-bold text-green-600">{stats.totalUsers || 0}</div>
                <div className="text-sm text-green-700">Total Students</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 cursor-pointer hover:bg-purple-100 transition" onClick={() => setAnalyticsModal('borrows')}>
                <div className="text-2xl font-bold text-purple-600">{stats.mostBorrowed.reduce((sum, b) => sum + b.count, 0) || 0}</div>
                <div className="text-sm text-purple-700">Total Borrows</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer hover:bg-red-100 transition" onClick={() => setAnalyticsModal('overdue')}>
                <div className="text-2xl font-bold text-red-600">{stats.overdueCount || 0}</div>
                <div className="text-sm text-red-700">Overdue Books</div>
              </div>
            </div>
            {/* Analytics Modals */}
            <AnalyticsModal open={analyticsModal === 'books'} onClose={() => setAnalyticsModal(null)} title="Total Books">
              {/* You can add a detailed list or chart of books here */}
              <div>Total books in the library: <b>{stats.totalBooks}</b></div>
            </AnalyticsModal>
            <AnalyticsModal open={analyticsModal === 'students'} onClose={() => setAnalyticsModal(null)} title="Total Students">
              {/* You can add a detailed list or chart of students here */}
              <div>Total students registered: <b>{stats.totalUsers}</b></div>
            </AnalyticsModal>
            <AnalyticsModal open={analyticsModal === 'borrows'} onClose={() => setAnalyticsModal(null)} title="Total Borrows">
              {/* You can add a detailed list or chart of borrows here */}
              <div>Total borrows: <b>{stats.mostBorrowed.reduce((sum, b) => sum + b.count, 0)}</b></div>
            </AnalyticsModal>
            <AnalyticsModal open={analyticsModal === 'overdue'} onClose={() => setAnalyticsModal(null)} title="Overdue Books">
              {/* You can add a detailed list or table of overdue books here */}
              <div>Total overdue books: <b>{stats.overdueCount}</b></div>
            </AnalyticsModal>
          </>
        )}
      </main>
      <LibraryFooter />
    </div>
  );
};

// Helper: Merge category trends for line/bar chart
function mergeCategoryTrends(categoryTrends: { category: string; data: { month: string; count: number }[] }[], selectedCategory: string | null) {
  if (selectedCategory) {
    const cat = categoryTrends.find(c => c.category === selectedCategory);
    if (!cat) return [];
    return cat.data.map(d => ({ month: d.month, [selectedCategory]: d.count }));
  }
  // Merge all categories
  const allMonths = Array.from(new Set(categoryTrends.flatMap(c => c.data.map(d => d.month)))).sort();
  return allMonths.map(month => {
    const obj: Record<string, any> = { month };
    categoryTrends.forEach(c => {
      const found = c.data.find(d => d.month === month);
      obj[c.category] = found ? found.count : 0;
    });
    return obj;
  });
}
// Helper: Get category keys for chart
function getCategoryKeys(categoryTrends: { category: string; data: { month: string; count: number }[] }[], selectedCategory: string | null) {
  if (selectedCategory) return [selectedCategory];
  return categoryTrends.map(c => c.category);
}

// Payment Gateway Component
const PayFines = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [totalFines, setTotalFines] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Calculate total fines for the current user
    const calculateUserFines = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }

      // Get user's borrow records
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('email', user.email)
        .single();

      if (studentData) {
        const { data: borrowData } = await supabase
          .from('borrow_records')
          .select('due_at, returned_at')
          .eq('student_id', studentData.id);

        const fines = (borrowData || []).reduce((total, record) => {
          if (record.due_at && !record.returned_at) {
            return total + calculateFine(record.due_at);
          }
          return total;
        }, 0);
        setTotalFines(fines);
      }
    };

    calculateUserFines();
  }, [navigate]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/student-dashboard');
      }, 2000);
    }, 2000);
  };

  if (totalFines === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-accent/10">
        <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 md:p-10 flex flex-col items-center backdrop-blur-md border border-blue-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">No Outstanding Fines</h1>
            <p className="text-muted-foreground mb-6">You don't have any overdue fines to pay.</p>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-accent/10">
      <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 md:p-10 backdrop-blur-md border border-blue-100">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Pay Fines</h1>
          <p className="text-muted-foreground">Outstanding library fines</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground">Your fines have been paid. Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            {/* Payment Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900">Total Amount Due:</span>
                <span className="text-2xl font-bold text-blue-900">${totalFines.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayment} className="space-y-4">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Credit/Debit Card
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    UPI
                  </label>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <>
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === 'upi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="username@upi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              {/* Pay Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? 'Processing Payment...' : `Pay $${totalFines.toFixed(2)}`}
              </button>
            </form>

            {/* Cancel Button */}
            <button
              onClick={() => navigate('/student-dashboard')}
              className="w-full mt-4 text-gray-600 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
