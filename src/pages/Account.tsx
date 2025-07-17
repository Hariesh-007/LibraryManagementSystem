import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

type Book = {
  id: string;
  title: string;
  author?: string;
  description?: string;
  isbn?: string;
  category?: string;
  cover_url?: string;
  available_copies?: number;
};

const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [borrowed, setBorrowed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [recommended, setRecommended] = useState<Book[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        window.location.replace('/signin');
        setAuthChecked(true);
        return;
      }
      setUser(authData.user);
      setFullName(authData.user.user_metadata?.full_name || '');
      setPhotoUrl(authData.user.user_metadata?.photo_url || '');
      // Determine role by checking students and staff tables
      let foundRole: 'student' | 'staff' = 'student';
      let borrowedData: any[] = [];
      let studentData = null;
      let staffData = null;
      // Check students table
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('email', authData.user.email)
        .single();
      if (student && !studentError) {
        foundRole = 'student';
        studentData = student;
        // Fetch borrowed books for student
        const { data: borrowedRes } = await supabase
          .from('borrow_records')
          .select('id, book:books(id, title, author, cover_url, category), borrowed_at, due_at, returned_at, status')
          .eq('student_id', student.id)
          .order('borrowed_at', { ascending: false });
        borrowedData = borrowedRes || [];
        // --- Recommendation Logic ---
        // Get categories from borrowed books
        const borrowedBookIds = (borrowedRes || []).map((r: any) => r.book?.id).filter(Boolean);
        const categories = Array.from(new Set((borrowedRes || []).map((r: any) => r.book?.category).filter(Boolean)));
        if (categories.length > 0) {
          // Fetch books in those categories, excluding already borrowed
          const { data: recBooks } = await supabase
            .from('books')
            .select('*')
            .in('category', categories)
            .not('id', 'in', borrowedBookIds.length > 0 ? borrowedBookIds : [''])
            .limit(10);
          setRecommended(recBooks || []);
        } else {
          setRecommended([]);
        }
      } else {
        // Check staff table
        const { data: staff, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('email', authData.user.email)
          .single();
        if (staff && !staffError) {
          foundRole = 'staff';
          staffData = staff;
        }
        setRecommended([]);
      }
      setRole(foundRole);
      setBorrowed(borrowedData);
      setStudentInfo(studentData);
      setStaffInfo(staffData);
      setLoading(false);
      setAuthChecked(true);
    };
    fetchUser();
  }, []);

  if (!authChecked) {
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

  if (!authChecked && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditMode(true);
    setSuccess('');
    setError('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setPassword('');
    setSuccess('');
    setError('');
  };

  const handleSave = async () => {
    setSuccess('');
    setError('');
    // Update name
    const updates: any = { full_name: fullName };
    if (photoUrl) updates.photo_url = photoUrl;
    const { error: metaError } = await supabase.auth.updateUser({ data: updates });
    if (metaError) {
      setError('Failed to update profile.');
      return;
    }
    // Update password if provided
    if (password) {
      const { error: passError } = await supabase.auth.updateUser({ password });
      if (passError) {
        setError('Failed to update password.');
        return;
      }
    }
    setEditMode(false);
    setPassword('');
    setSuccess('Profile updated successfully!');
    // Refresh user info
    const { data: authData } = await supabase.auth.getUser();
    setUser(authData.user);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    setError('');
    setSuccess('');
    const file = e.target.files?.[0];
    if (!file) {
      setUploading(false);
      return;
    }
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError('Failed to upload photo.');
      setUploading(false);
      return;
    }
    // Get public URL
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
    setPhotoUrl(data.publicUrl);
    setSuccess('Photo uploaded! Click Save to update your profile.');
    setUploading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/signin';
  };

  return (
    <div className={
      role === 'staff'
        ? 'min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-accent/10 flex flex-col'
        : 'min-h-screen bg-gradient-to-br from-background via-muted/60 to-accent/10 flex flex-col'
    }>
      <LibraryNavbar />
      <main className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl">
          {/* Profile Card with Gradient Header */}
          <div className="relative rounded-2xl shadow-xl bg-card overflow-hidden mb-10">
            <div className={
              role === 'staff'
                ? 'h-32 bg-gradient-to-r from-blue-500/90 to-accent/80'
                : 'h-32 bg-gradient-to-r from-primary/90 to-accent/80'
            } />
            <div className="absolute left-1/2 top-16 transform -translate-x-1/2">
              <Avatar className="w-28 h-28 ring-4 ring-card shadow-lg">
                <AvatarImage src={photoUrl || user.user_metadata?.photo_url || '/placeholder.svg'} alt={fullName || user.email} />
                <AvatarFallback className="text-3xl">{(fullName || user.email)?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="pt-24 pb-8 px-6 flex flex-col items-center">
              {/* Main Name Display */}
              <div className="text-2xl font-bold text-primary mb-1">
                {role === 'student' && studentInfo?.name ? studentInfo.name :
                  role === 'staff' && staffInfo?.name ? staffInfo.name :
                  fullName || user.email}
              </div>
              <div className="text-muted-foreground mb-2">{user.email}</div>
              <span className={
                role === 'staff'
                  ? 'text-xs px-3 py-1 rounded-full bg-blue-500 text-white font-semibold mb-4 shadow'
                  : 'text-xs px-3 py-1 rounded-full bg-accent text-primary font-semibold mb-4 shadow'
              }>{role === 'staff' ? 'Staff Dashboard' : 'Student'}</span>
              {/* Adaptable Profile Details */}
              <div className="w-full max-w-xs mx-auto mb-4">
                {role === 'student' && studentInfo && (
                  <div className="space-y-2">
                    {studentInfo.username && (
                      <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-primary">Username:</span> <span>@{studentInfo.username}</span></div>
                    )}
                    {studentInfo.student_id && (
                      <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-primary">Student ID:</span> <span>{studentInfo.student_id}</span></div>
                    )}
                    {studentInfo.department && (
                      <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-primary">Department:</span> <span>{studentInfo.department}</span></div>
                    )}
                    {studentInfo.year && (
                      <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-primary">Year:</span> <span>{studentInfo.year}</span></div>
                    )}
                    {studentInfo.contact && (
                      <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-primary">Contact:</span> <span>{studentInfo.contact}</span></div>
                    )}
                  </div>
                )}
                {role === 'staff' && staffInfo && (
                  <div className="space-y-2">
                    {staffInfo.username && (
                      <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-primary">Username:</span> <span>@{staffInfo.username}</span></div>
                    )}
                    {staffInfo.staff_id && (
                      <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-primary">Staff ID:</span> <span>{staffInfo.staff_id}</span></div>
                    )}
                    {staffInfo.department && (
                      <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-primary">Department:</span> <span>{staffInfo.department}</span></div>
                    )}
                    {staffInfo.designation && (
                      <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-primary">Designation:</span> <span>{staffInfo.designation}</span></div>
                    )}
                    {staffInfo.contact && (
                      <div className="flex items-center gap-2 text-sm"><span className="font-semibold text-primary">Contact:</span> <span>{staffInfo.contact}</span></div>
                    )}
                  </div>
                )}
              </div>
              {success && <div className="mb-2 w-full"><div className="bg-green-100 text-green-800 px-4 py-2 rounded shadow text-center font-medium">{success}</div></div>}
              {error && <div className="mb-2 w-full"><div className="bg-red-100 text-red-800 px-4 py-2 rounded shadow text-center font-medium">{error}</div></div>}
              {editMode ? (
                <div className="w-full max-w-md mx-auto space-y-4 mt-2">
                  <div>
                    <label className="block mb-1 font-medium">Full Name</label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={photoUrl || user.user_metadata?.photo_url || '/placeholder.svg'} alt={fullName || user.email} />
                        <AvatarFallback>{(fullName || user.email)?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        className="block"
                        disabled={uploading}
                      />
                      {uploading && <span className="text-sm text-muted-foreground ml-2">Uploading...</span>}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">New Password</label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
                  </div>
                  <div className="flex gap-4 mt-4 justify-center">
                    <button className="bg-primary text-white px-6 py-2 rounded-full shadow hover:bg-primary/90 transition-all" onClick={handleSave}>Save</button>
                    <button className="bg-muted text-foreground px-6 py-2 rounded-full shadow hover:bg-muted/80 transition-all" onClick={handleCancel}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 mt-4 justify-center">
                  <button className="bg-primary text-white px-6 py-2 rounded-full shadow hover:bg-primary/90 transition-all" onClick={handleEdit}>Edit Profile</button>
                  <button className="bg-destructive text-white px-6 py-2 rounded-full shadow hover:bg-destructive/90 transition-all" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Content */}
          {role === 'student' ? (
            <>
              <div className="bg-card rounded-2xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-primary">Borrowed Books</h2>
                {borrowed.length === 0 ? (
                  <div className="text-muted-foreground">No borrowed books.</div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {borrowed.map(record => (
                      <div key={record.id} className="min-w-[220px] bg-muted rounded-xl shadow p-4 flex flex-col items-center">
                        <img
                          src={record.book?.cover_url || '/placeholder.svg'}
                          alt={record.book?.title}
                          className="w-20 h-32 object-cover rounded mb-2 shadow"
                        />
                        <div className="font-semibold text-center mb-1">{record.book?.title}</div>
                        <div className="text-sm text-muted-foreground text-center mb-1">{record.book?.author}</div>
                        <div className="flex flex-col items-center text-xs mb-1">
                          <span>Borrowed: {new Date(record.borrowed_at).toLocaleDateString()}</span>
                          <span>Due: {new Date(record.due_at).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold mb-1 ${record.status === 'returned' ? 'bg-green-200 text-green-800' : record.status === 'overdue' ? 'bg-red-200 text-red-800' : record.status === 'return_requested' ? 'bg-yellow-200 text-yellow-800' : 'bg-accent text-primary'}`}>{record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ')}</span>
                        {record.returned_at && <span className="text-xs text-muted-foreground">Returned: {new Date(record.returned_at).toLocaleDateString()}</span>}
                        {/* Return button logic */}
                        {record.status === 'borrowed' && !record.returned_at && (
                          <button
                            className="mt-2 px-4 py-1 rounded bg-yellow-500 text-white text-xs font-semibold hover:bg-yellow-600 transition-all"
                            onClick={async () => {
                              setLoading(true);
                              setError('');
                              setSuccess('');
                              const { error } = await supabase
                                .from('borrow_records')
                                .update({ status: 'return_requested' })
                                .eq('id', record.id);
                              if (error) {
                                setError('Failed to request return.');
                              } else {
                                setSuccess('Return request sent!');
                                // Update UI
                                setBorrowed(borrowed => borrowed.map(r => r.id === record.id ? { ...r, status: 'return_requested' } : r));
                              }
                              setLoading(false);
                            }}
                          >
                            Return
                          </button>
                        )}
                        {record.status === 'return_requested' && !record.returned_at && (
                          <span className="mt-2 px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">Return Pending Staff Approval</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-600">Staff Tools</h2>
              <ul className="space-y-3">
                <li className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 text-blue-900 font-medium shadow-sm">Manage Books (Coming Soon)</li>
                <li className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 text-blue-900 font-medium shadow-sm">View Borrow Requests (Coming Soon)</li>
                <li className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 text-blue-900 font-medium shadow-sm">Overdue Books (Coming Soon)</li>
                <li className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 text-blue-900 font-medium shadow-sm">Analytics & Reports (Coming Soon)</li>
              </ul>
            </div>
          )}
        </div>
      </main>
      <LibraryFooter />
    </div>
  );
};

export default Account;