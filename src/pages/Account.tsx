import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LibraryNavbar from '@/components/LibraryNavbar';
import LibraryFooter from '@/components/LibraryFooter';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Target, Heart, TrendingUp, Clock, DollarSign, Bell } from 'lucide-react';

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
  
  // New features state
  const [readingStats, setReadingStats] = useState({
    totalBooksRead: 0,
    booksThisMonth: 0,
    favoriteGenre: '',
    averageRating: 0,
    readingStreak: 0,
    totalFines: 0
  });
  const [readingGoal, setReadingGoal] = useState(12); // Books per year
  const [goalProgress, setGoalProgress] = useState(0);
  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState({
    dueDateReminder: true,
    newBookNotifications: true,
    fineAlerts: true
  });

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
      
      // Fetch additional data for students
      if (foundRole === 'student' && studentData) {
        await fetchReadingStats(studentData.id);
        await fetchWishlist(authData.user.id);
        await fetchReadingHistory(studentData.id);
      }
    };
    fetchUser();
  }, []);

  // Fetch reading statistics
  const fetchReadingStats = async (studentId: string) => {
    try {
      // Get all borrow records for the student
      const { data: allRecords } = await supabase
        .from('borrow_records')
        .select('*, books(category)')
        .eq('student_id', studentId);

      if (allRecords) {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        
        // Calculate statistics
        const totalBooksRead = allRecords.filter(r => r.returned_at).length;
        const booksThisMonth = allRecords.filter(r => 
          r.returned_at && new Date(r.returned_at).getMonth() === currentMonth &&
          new Date(r.returned_at).getFullYear() === currentYear
        ).length;
        
        // Find favorite genre
        const genreCounts: { [key: string]: number } = {};
        allRecords.forEach(r => {
          if (r.books?.category) {
            genreCounts[r.books.category] = (genreCounts[r.books.category] || 0) + 1;
          }
        });
        const favoriteGenre = Object.keys(genreCounts).reduce((a, b) => 
          genreCounts[a] > genreCounts[b] ? a : b, ''
        ) || 'None';

        // Calculate total fines (simplified)
        const totalFines = allRecords.reduce((total, record) => {
          if (record.due_at && !record.returned_at) {
            const daysOverdue = Math.floor((new Date().getTime() - new Date(record.due_at).getTime()) / (1000 * 60 * 60 * 24));
            return total + Math.max(0, daysOverdue) * 0.50;
          }
          return total;
        }, 0);

        setReadingStats({
          totalBooksRead,
          booksThisMonth,
          favoriteGenre,
          averageRating: 4.2, // Mock data
          readingStreak: Math.floor(Math.random() * 30), // Mock data
          totalFines
        });

        // Calculate goal progress
        const booksThisYear = allRecords.filter(r => 
          r.returned_at && new Date(r.returned_at).getFullYear() === currentYear
        ).length;
        setGoalProgress((booksThisYear / readingGoal) * 100);
      }
    } catch (error) {
      console.error('Error fetching reading stats:', error);
    }
  };

  // Fetch wishlist
  const fetchWishlist = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('wishlists')
        .select('*, books(*)')
        .eq('user_id', userId);
      
      if (data) {
        setWishlist(data.map((item: any) => item.books));
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  // Fetch reading history
  const fetchReadingHistory = async (studentId: string) => {
    try {
      const { data } = await supabase
        .from('borrow_records')
        .select('*, books(*)')
        .eq('student_id', studentId)
        .order('borrowed_at', { ascending: false });
      
      if (data) {
        setReadingHistory(data);
      }
    } catch (error) {
      console.error('Error fetching reading history:', error);
    }
  };

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
              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-2 mb-6 bg-card rounded-2xl p-2 shadow-lg">
                {[
                  { id: 'overview', label: 'Overview', icon: BookOpen },
                  { id: 'books', label: 'My Books', icon: Calendar },
                  { id: 'goals', label: 'Reading Goals', icon: Target },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart },
                  { id: 'stats', label: 'Statistics', icon: TrendingUp },
                  { id: 'settings', label: 'Settings', icon: Bell }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary text-white shadow-md'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Reading Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Books Read</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{readingStats.totalBooksRead}</div>
                        <p className="text-xs text-muted-foreground">
                          +{readingStats.booksThisMonth} this month
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reading Streak</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{readingStats.readingStreak}</div>
                        <p className="text-xs text-muted-foreground">days in a row</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Fines</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${readingStats.totalFines.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                          {readingStats.totalFines > 0 ? 'Please pay soon' : 'All clear!'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Reading Goal Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Reading Goal Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Goal: {readingGoal} books this year</span>
                          <span>{Math.floor((goalProgress * readingGoal) / 100)} / {readingGoal}</span>
                        </div>
                        <Progress value={goalProgress} className="w-full" />
                        <p className="text-xs text-muted-foreground">
                          {goalProgress >= 100 ? '🎉 Goal achieved!' : `${(100 - goalProgress).toFixed(1)}% to go`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                          <BookOpen className="w-6 h-6" />
                          <span className="text-xs">Browse Catalog</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                          <Clock className="w-6 h-6" />
                          <span className="text-xs">Renew Books</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                          <Heart className="w-6 h-6" />
                          <span className="text-xs">View Wishlist</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                          <DollarSign className="w-6 h-6" />
                          <span className="text-xs">Pay Fines</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* My Books Tab */}
              {activeTab === 'books' && (
                <div className="bg-card rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4 text-primary">Currently Borrowed Books</h2>
                  {borrowed.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No borrowed books currently.</p>
                      <Button className="mt-4">Browse Catalog</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {borrowed.map(record => (
                        <Card key={record.id} className="overflow-hidden">
                          <div className="aspect-[3/4] relative">
                            <img
                              src={record.book?.cover_url || '/placeholder.svg'}
                              alt={record.book?.title}
                              className="w-full h-full object-cover"
                            />
                            <Badge 
                              className={`absolute top-2 right-2 ${
                                record.status === 'returned' ? 'bg-green-500' :
                                record.status === 'overdue' ? 'bg-red-500' :
                                record.status === 'return_requested' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`}
                            >
                              {record.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-1 line-clamp-2">{record.book?.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{record.book?.author}</p>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Borrowed: {new Date(record.borrowed_at).toLocaleDateString()}</div>
                              <div>Due: {new Date(record.due_at).toLocaleDateString()}</div>
                              {record.returned_at && (
                                <div>Returned: {new Date(record.returned_at).toLocaleDateString()}</div>
                              )}
                            </div>
                            {record.status === 'borrowed' && !record.returned_at && (
                              <Button
                                size="sm"
                                className="w-full mt-3"
                                onClick={async () => {
                                  setLoading(true);
                                  const { error } = await supabase
                                    .from('borrow_records')
                                    .update({ status: 'return_requested' })
                                    .eq('id', record.id);
                                  if (!error) {
                                    setBorrowed(borrowed => borrowed.map(r => 
                                      r.id === record.id ? { ...r, status: 'return_requested' } : r
                                    ));
                                  }
                                  setLoading(false);
                                }}
                              >
                                Request Return
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reading Goals Tab */}
              {activeTab === 'goals' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Reading Goals & Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Annual Reading Goal</label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          value={readingGoal}
                          onChange={(e) => setReadingGoal(Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">books per year</span>
                        <Button size="sm">Update Goal</Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Progress This Year</h3>
                      <Progress value={goalProgress} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {Math.floor((goalProgress * readingGoal) / 100)} of {readingGoal} books completed
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Achievements</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { title: 'First Book', description: 'Read your first book', achieved: readingStats.totalBooksRead > 0 },
                          { title: 'Speed Reader', description: '5 books in a month', achieved: readingStats.booksThisMonth >= 5 },
                          { title: 'Bookworm', description: '25 books total', achieved: readingStats.totalBooksRead >= 25 },
                          { title: 'Scholar', description: '50 books total', achieved: readingStats.totalBooksRead >= 50 }
                        ].map((achievement, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${achievement.achieved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="text-center">
                              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${achievement.achieved ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                                🏆
                              </div>
                              <h4 className="font-semibold text-sm">{achievement.title}</h4>
                              <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      My Wishlist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {wishlist.length === 0 ? (
                      <div className="text-center py-8">
                        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                        <Button>Browse Books to Add</Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wishlist.map((book, index) => (
                          <Card key={index} className="overflow-hidden">
                            <div className="aspect-[3/4] relative">
                              <img
                                src={book.cover_url || '/placeholder.svg'}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold mb-1">{book.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                              <div className="flex gap-2">
                                <Button size="sm" className="flex-1">Borrow</Button>
                                <Button size="sm" variant="outline">Remove</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Statistics Tab */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Reading Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-3">Reading Summary</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total Books Read:</span>
                              <span className="font-semibold">{readingStats.totalBooksRead}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Books This Month:</span>
                              <span className="font-semibold">{readingStats.booksThisMonth}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Current Streak:</span>
                              <span className="font-semibold">{readingStats.readingStreak} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Favorite Genre:</span>
                              <span className="font-semibold">{readingStats.favoriteGenre}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-3">Financial Summary</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Outstanding Fines:</span>
                              <span className="font-semibold text-red-600">${readingStats.totalFines.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Books Currently Borrowed:</span>
                              <span className="font-semibold">{borrowed.filter(b => !b.returned_at).length}</span>
                            </div>
                          </div>
                          {readingStats.totalFines > 0 && (
                            <Button className="w-full mt-4" variant="destructive">
                              Pay Outstanding Fines
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Reading History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {readingHistory.slice(0, 10).map((record, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <img
                              src={record.book?.cover_url || '/placeholder.svg'}
                              alt={record.book?.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{record.book?.title}</h4>
                              <p className="text-xs text-muted-foreground">{record.book?.author}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(record.borrowed_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={record.returned_at ? 'default' : 'secondary'}>
                              {record.returned_at ? 'Returned' : 'Current'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Due Date Reminders</h3>
                        <p className="text-sm text-muted-foreground">Get notified when books are due soon</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.dueDateReminder}
                        onChange={(e) => setNotifications(prev => ({ ...prev, dueDateReminder: e.target.checked }))}
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">New Book Notifications</h3>
                        <p className="text-sm text-muted-foreground">Get notified about new books in your favorite genres</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.newBookNotifications}
                        onChange={(e) => setNotifications(prev => ({ ...prev, newBookNotifications: e.target.checked }))}
                        className="w-4 h-4"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Fine Alerts</h3>
                        <p className="text-sm text-muted-foreground">Get notified about outstanding fines</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.fineAlerts}
                        onChange={(e) => setNotifications(prev => ({ ...prev, fineAlerts: e.target.checked }))}
                        className="w-4 h-4"
                      />
                    </div>

                    <Button className="w-full mt-6">Save Preferences</Button>
                  </CardContent>
                </Card>
              )}
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