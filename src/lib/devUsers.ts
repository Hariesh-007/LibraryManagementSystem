// Development mode sample users for testing
export const DEV_USERS = {
  students: [
    {
      id: 'dev-student-1',
      email: 'alice.johnson@student.klu.ac.in',
      password: 'student123',
      full_name: 'Alice Johnson',
      student_id: 'STU001',
      department: 'Computer Science',
      year: 3,
      phone: '+1234567890',
      address: '123 University Ave',
      enrollment_date: '2022-09-01',
      status: 'active',
      photo_url: ''
    },
    {
      id: 'dev-student-2',
      email: 'bob.wilson@student.klu.ac.in',
      password: 'student123',
      full_name: 'Bob Wilson',
      student_id: 'STU002',
      department: 'Mechanical Engineering',
      year: 2,
      phone: '+1234567891',
      address: '456 College Street',
      enrollment_date: '2023-09-01',
      status: 'active',
      photo_url: ''
    },
    {
      id: 'dev-student-3',
      email: '2300080343@kluniversity.in',
      password: 'student123',
      full_name: 'Student Demo',
      student_id: '2300080343',
      department: 'Computer Science',
      year: 3,
      phone: '+1234567892',
      address: '789 Campus Drive',
      enrollment_date: '2022-09-01',
      status: 'active',
      photo_url: ''
    },
    {
      id: 'dev-student-4',
      email: '2300080343@student.klu.ac.in',
      password: 'student123',
      full_name: 'Student Demo Alt',
      student_id: '2300080343',
      department: 'Computer Science',
      year: 3,
      phone: '+1234567893',
      address: '789 Campus Drive',
      enrollment_date: '2022-09-01',
      status: 'active',
      photo_url: ''
    }
  ],
  staff: [
    {
      id: 'dev-staff-1',
      email: 'sarah.chen@klu.ac.in',
      password: 'staff123',
      full_name: 'Sarah Chen',
      staff_id: 'STF001',
      department: 'Library Administration',
      position: 'Head Librarian',
      phone: '+1234567892',
      hire_date: '2020-01-15',
      status: 'active',
      photo_url: ''
    },
    {
      id: 'dev-staff-2',
      email: 'michael.rodriguez@klu.ac.in',
      password: 'staff123',
      full_name: 'Michael Rodriguez',
      staff_id: 'STF002',
      department: 'Library Services',
      position: 'Assistant Librarian',
      phone: '+1234567893',
      hire_date: '2021-03-20',
      status: 'active',
      photo_url: ''
    }
  ]
};

export const DEV_BOOKS = [
  {
    id: 'dev-book-1',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    cover_url: '/placeholder.svg',
    category: 'Programming',
    description: 'A comprehensive guide to JavaScript programming best practices.',
    isbn: '978-0596517748',
    available_copies: 5
  },
  {
    id: 'dev-book-2',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    cover_url: '/placeholder.svg',
    category: 'Programming',
    description: 'A handbook of agile software craftsmanship.',
    isbn: '978-0132350884',
    available_copies: 3
  },
  {
    id: 'dev-book-3',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    cover_url: '/placeholder.svg',
    category: 'Computer Science',
    description: 'Comprehensive introduction to algorithms and data structures.',
    isbn: '978-0262033848',
    available_copies: 2
  }
];

export const DEV_BORROW_RECORDS = [
  {
    id: 'dev-borrow-1',
    student_id: 'dev-student-1',
    book_id: 'dev-book-1',
    borrowed_at: '2024-01-15T10:00:00Z',
    due_at: '2024-02-15T23:59:59Z',
    returned_at: null,
    status: 'borrowed'
  },
  {
    id: 'dev-borrow-2',
    student_id: 'dev-student-1',
    book_id: 'dev-book-2',
    borrowed_at: '2024-01-10T14:30:00Z',
    due_at: '2024-02-10T23:59:59Z',
    returned_at: '2024-01-25T09:15:00Z',
    status: 'returned'
  }
];

// Utility functions for development mode
export const isDevelopmentMode = () => {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
};

export const initializeDevData = () => {
  if (!isDevelopmentMode()) return;
  
  const existingStudents = localStorage.getItem('dev_students');
  const existingStaff = localStorage.getItem('dev_staff');
  const existingBooks = localStorage.getItem('dev_books');
  const existingRecords = localStorage.getItem('dev_borrow_records');
  
  if (!existingStudents) {
    localStorage.setItem('dev_students', JSON.stringify(DEV_USERS.students));
  }
  if (!existingStaff) {
    localStorage.setItem('dev_staff', JSON.stringify(DEV_USERS.staff));
  }
  if (!existingBooks) {
    localStorage.setItem('dev_books', JSON.stringify(DEV_BOOKS));
  }
  if (!existingRecords) {
    localStorage.setItem('dev_borrow_records', JSON.stringify(DEV_BORROW_RECORDS));
  }
};

export const getDevUser = (email: string, password: string) => {
  if (!isDevelopmentMode()) return null;
  
  const students = JSON.parse(localStorage.getItem('dev_students') || '[]');
  const staff = JSON.parse(localStorage.getItem('dev_staff') || '[]');
  
  // Check students
  const student = students.find((s: any) => s.email === email && s.password === password);
  if (student) {
    return { user: student, type: 'student' };
  }
  
  // Check staff
  const staffMember = staff.find((s: any) => s.email === email && s.password === password);
  if (staffMember) {
    return { user: staffMember, type: 'staff' };
  }
  
  return null;
};

export const getDevBorrowedBooks = (studentId: string) => {
  if (!isDevelopmentMode()) return [];
  
  const records = JSON.parse(localStorage.getItem('dev_borrow_records') || '[]');
  const books = JSON.parse(localStorage.getItem('dev_books') || '[]');
  
  return records
    .filter((record: any) => record.student_id === studentId)
    .map((record: any) => {
      const book = books.find((b: any) => b.id === record.book_id);
      return {
        ...record,
        book: book || null
      };
    })
    .filter((record: any) => record.book !== null);
};

// Check if we should use development mode (when Supabase is not accessible)
export const shouldUseDevelopmentMode = async () => {
  if (!isDevelopmentMode()) return false;
  
  try {
    // Try to make a simple request to Supabase to check connectivity
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
      }
    });
    return !response.ok;
  } catch (error) {
    console.warn('[Dev Mode] Supabase not accessible, using development mode');
    return true;
  }
};
