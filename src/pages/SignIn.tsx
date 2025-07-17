import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    // 2. Check if user exists in students table
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();

    if (student && !studentError) {
      localStorage.setItem('student', JSON.stringify(student));
      window.location.href = '/catalog'; // Redirect students to catalog
      return;
    }

    // 3. If not a student, check staff table
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .single();

    if (staff && !staffError) {
      localStorage.setItem('staff', JSON.stringify(staff));
      window.location.href = '/account'; // Redirect staff to their account page
      return;
    }

    // 4. Not a registered student or staff: log out and show error
    await supabase.auth.signOut();
    setError('Your account is not registered as a student or staff. Please contact the library.');
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg('');
    setError('');
    if (!resetEmail) {
      setError('Please enter your email.');
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail);
    if (resetError) {
      setError('Failed to send reset email. Please check your email address.');
    } else {
      setResetMsg('Password reset email sent! Please check your inbox.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LibraryNavbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-card p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Sign In</h2>
          {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
          {showForgot ? (
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded font-semibold mb-2"
              >
                Send Reset Email
              </button>
              <button
                type="button"
                className="w-full bg-muted text-foreground py-2 rounded font-semibold"
                onClick={() => { setShowForgot(false); setResetMsg(''); setError(''); }}
              >
                Back to Sign In
              </button>
              {resetMsg && <div className="mt-4 text-green-600 font-semibold">{resetMsg}</div>}
            </form>
          ) : (
            <form onSubmit={handleSignIn}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block mb-1 font-medium">Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded font-semibold mb-2"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <button
                type="button"
                className="w-full bg-muted text-foreground py-2 rounded font-semibold"
                onClick={() => { setShowForgot(true); setResetMsg(''); setError(''); }}
              >
                Forgot Password?
              </button>
            </form>
          )}
        </div>
      </main>
      <LibraryFooter />
    </div>
  );
};

export default SignIn; 