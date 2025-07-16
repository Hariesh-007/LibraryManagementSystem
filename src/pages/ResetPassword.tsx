import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Check for access token in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('access_token')) {
      setError('Invalid or missing reset token. Please use the link from your email.');
      setTokenChecked(true);
      return;
    }
    setTokenChecked(true);
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || !confirm) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    // Supabase automatically sets the access token from the URL hash
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError('Failed to reset password. The link may have expired.');
      setLoading(false);
      return;
    }
    setSuccess('Password reset successful! You can now sign in with your new password.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LibraryNavbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-card p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
          {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
          {success && <div className="mb-4 text-green-600 font-semibold">{success}</div>}
          {tokenChecked && !success && (
            <form onSubmit={handleReset}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">New Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block mb-1 font-medium">Confirm Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded font-semibold"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          {success && (
            <a href="/signin" className="block mt-4 text-primary font-semibold text-center">Back to Sign In</a>
          )}
        </div>
      </main>
      <LibraryFooter />
    </div>
  );
};

export default ResetPassword; 