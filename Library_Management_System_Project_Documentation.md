# 📚 Library Management System - Complete Project Documentation

## Project Overview
A comprehensive **Library Management System for KL University** built with modern web technologies. This system serves both students and staff with distinct interfaces and comprehensive functionality for managing library operations.

---

## 🛠️ Technology Stack

### Frontend Framework
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **React Router v6** for client-side routing

### Styling & UI Components
- **TailwindCSS** for utility-first styling
- **shadcn/ui** component library based on Radix UI
- **Radix UI** primitives for accessibility
- **Lucide React** for icons

### Backend & Database
- **Supabase** for backend services
  - PostgreSQL database
  - Authentication system
  - File storage
  - Real-time subscriptions

### State Management & Data Fetching
- **TanStack React Query** for server state management
- **React Context** for global state
- **React Hooks** for local state

### 3D Graphics & Visualization
- **@react-three/fiber** for 3D rendering
- **@react-three/drei** for 3D helpers
- **Recharts** for data visualization and analytics

### Development & Deployment
- **TypeScript** for type safety
- **ESLint** for code linting
- **Vercel** for hosting and analytics
- **Bun** for package management

---

## 🗃️ Database Schema

### Core Tables

#### 1. students
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    year TEXT,
    contact TEXT,
    department TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. staff
```sql
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    staff_id TEXT UNIQUE NOT NULL,
    department TEXT,
    username TEXT UNIQUE,
    position TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. books
```sql
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    available_copies INTEGER DEFAULT 1,
    total_copies INTEGER DEFAULT 1,
    is_digital BOOLEAN DEFAULT FALSE,
    digital_url TEXT,
    publication_year INTEGER,
    publisher TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. borrow_records
```sql
CREATE TABLE borrow_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE NULL,
    status TEXT DEFAULT 'borrowed' CHECK (status IN ('pending', 'approved', 'borrowed', 'return_requested', 'returned', 'rejected', 'overdue')),
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. reservations
```sql
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'reserved' CHECK (status IN ('reserved', 'waitlisted', 'fulfilled', 'cancelled')),
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. wishlists
```sql
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);
```

#### 7. reading_goals
```sql
CREATE TABLE reading_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    target_books INTEGER DEFAULT 12,
    current_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, year)
);
```

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_borrow_records_student_id ON borrow_records(student_id);
CREATE INDEX idx_borrow_records_book_id ON borrow_records(book_id);
CREATE INDEX idx_borrow_records_status ON borrow_records(status);
CREATE INDEX idx_borrow_records_due_at ON borrow_records(due_at);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_available_copies ON books(available_copies);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
```

---

## 🎯 Core Features

### Authentication System
- **Supabase Auth Integration**
  - Email/password authentication
  - Password reset via email
  - Role-based access control
  - Session management
  - Development mode for offline testing

### Student Features

#### 1. Homepage & Navigation
- Hero section with library information
- Featured books and announcements
- Personalized recommendations
- Quick access to catalog and digital resources

#### 2. Book Catalog & Search
- **Browse by Category**: Science, Fiction, History, Technology, etc.
- **Advanced Search**: Title, author, ISBN, category filtering
- **Book Details**: Cover images, descriptions, availability status
- **Real-time Availability**: Live updates of book status

#### 3. Borrowing System
- **4-Book Limit**: Automatic enforcement per student
- **Due Date Management**: 14-day borrowing period
- **Fine Calculation**: $0.50 per day for overdue books
- **Return Requests**: Digital return request system
- **Borrowing History**: Complete transaction history

#### 4. Personal Dashboard
- **Account Information**: Profile management with photo upload
- **Current Borrows**: Active loans with due dates and fine status
- **Reading Statistics**: Books read, favorite genres, reading streaks
- **Reading Goals**: Annual reading targets and progress tracking
- **Book Recommendations**: AI-powered suggestions based on history

#### 5. Digital Resources
- **E-book Access**: Direct links to digital collections
- **Research Papers**: Academic journal access
- **Multimedia Resources**: Audio and video materials

#### 6. Interactive Features
- **Wishlist Management**: Save books for future reading
- **Rating System**: Rate and review borrowed books
- **Reading Progress**: Track reading completion
- **Social Features**: Share reading achievements

### Staff Features

#### 1. Staff Dashboard
- **Role-based Interface**: Different views for librarians vs admins
- **Quick Stats**: Overview of library operations
- **Pending Actions**: Return requests, overdue items
- **Student Search**: Find students by ID or name

#### 2. Borrow Management
- **Return Approval**: Process return requests
- **Overdue Tracking**: Monitor and manage overdue books
- **Fine Management**: Calculate and track student fines
- **Borrowing History**: Complete student borrowing records

#### 3. Book Management
- **Add New Books**: Complete book information entry
- **Edit Book Details**: Update availability, descriptions, categories
- **Cover Upload**: Image management via Supabase storage
- **Bulk Operations**: Mass updates and imports
- **Digital Resources**: Manage e-book links and digital content

#### 4. Request Oversight
- **Borrow Approval**: Review and approve borrowing requests
- **Reservation Management**: Handle book reservations and waitlists
- **Student Verification**: Ensure borrowing limits compliance
- **Priority Handling**: Academic vs recreational borrowing priorities

#### 5. Analytics Dashboard
- **Usage Statistics**: Library utilization metrics
- **Popular Books**: Most borrowed titles and trending genres
- **Student Analytics**: Reading patterns and engagement
- **Category Performance**: Subject-wise borrowing trends
- **Overdue Analysis**: Late return patterns and interventions
- **Interactive Charts**: Visual data representation using Recharts

---

## 🎨 UI/UX Design System

### Color Palette
```css
:root {
  /* Primary Colors */
  --primary: 220 54% 46%;        /* Blue #2563eb */
  --primary-foreground: 210 40% 98%;
  
  /* Secondary Colors */
  --accent: 210 40% 80%;         /* Light blue accent */
  --accent-foreground: 222.2 84% 4.9%;
  
  /* Background Colors */
  --background: 0 0% 100%;       /* White */
  --foreground: 222.2 84% 4.9%;
  
  /* UI Element Colors */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  
  /* Status Colors */
  --destructive: 0 84.2% 60.2%;  /* Red for errors */
  --success: 142.1 76.2% 36.3%;  /* Green for success */
  --warning: 32 95% 44%;         /* Orange for warnings */
}
```

### Typography Scale
- **Display**: 2.5rem (40px) - Page headers
- **Heading 1**: 2rem (32px) - Section headers
- **Heading 2**: 1.5rem (24px) - Subsection headers
- **Heading 3**: 1.25rem (20px) - Card headers
- **Body**: 1rem (16px) - Regular text
- **Small**: 0.875rem (14px) - Secondary text
- **Caption**: 0.75rem (12px) - Labels and captions

### Component Design Patterns

#### Cards
```tsx
// Standard card with shadow and hover effects
<Card className="hover:shadow-lg transition-all duration-200">
  <CardHeader>
    <CardTitle className="text-xl font-semibold text-primary">
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

#### Buttons
```tsx
// Primary action button
<Button className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-6 py-3 shadow-md transition-all duration-200">
  Primary Action
</Button>

// Secondary button
<Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
  Secondary Action
</Button>
```

#### Data Tables
```tsx
// Responsive table with pagination
<Table className="min-w-full">
  <TableHeader>
    <TableRow>
      <TableHead className="text-left font-semibold">Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id} className="hover:bg-muted/50">
        <TableCell>{item.value}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 🏗️ Project Structure

```
LibraryManagementSystem/
├── public/
│   ├── favicon.ico
│   ├── kl-university-logo.svg
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── LibraryNavbar.tsx   # Main navigation
│   │   ├── LibraryFooter.tsx   # Footer component
│   │   ├── HeroSection.tsx     # Homepage hero
│   │   ├── FeaturesSection.tsx # Student features
│   │   └── StaffFeaturesSection.tsx # Staff features
│   ├── pages/
│   │   ├── Index.tsx           # Homepage
│   │   ├── SignIn.tsx          # Authentication
│   │   ├── Account.tsx         # User dashboard
│   │   ├── Catalog.tsx         # Book browsing
│   │   ├── ManageBooks.tsx     # Staff book management
│   │   ├── StaffLanding.tsx    # Staff homepage
│   │   ├── DigitalResources.tsx # Digital library
│   │   ├── SearchResults.tsx   # Search functionality
│   │   ├── About.tsx           # About page
│   │   └── NotFound.tsx        # 404 page
│   ├── lib/
│   │   ├── supabaseClient.ts   # Database connection
│   │   ├── utils.ts            # Utility functions
│   │   ├── devUsers.ts         # Development mode users
│   │   └── localAuth.ts        # Local authentication
│   ├── hooks/
│   │   └── use-toast.ts        # Toast notifications
│   ├── integrations/
│   │   └── supabase/
│   │       └── types.ts        # Database types
│   ├── assets/
│   │   ├── kl-university-logo.svg
│   │   └── library-hero.jpg
│   ├── App.tsx                 # Main application
│   ├── main.tsx               # Entry point
│   ├── index.css              # Global styles
│   └── vite-env.d.ts          # Vite types
├── components.json             # shadcn/ui config
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite configuration
└── vercel.json                # Deployment config
```

---

## 🔧 Implementation Details

### Key Algorithms

#### Fine Calculation
```typescript
const calculateFine = (dueDate: string, returnedDate?: string): number => {
  const due = new Date(dueDate);
  const returned = returnedDate ? new Date(returnedDate) : new Date();
  const daysOverdue = Math.floor((returned.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysOverdue) * 0.50; // $0.50 per day
};
```

#### Book Recommendation System
```typescript
const generateRecommendations = async (studentId: string): Promise<RecommendedBook[]> => {
  // 1. Get student's borrowing history
  const borrowHistory = await getBorrowHistory(studentId);
  
  // 2. Extract preferred categories
  const preferredCategories = extractCategories(borrowHistory);
  
  // 3. Get popular books in those categories
  const popularBooks = await getPopularBooksByCategory(preferredCategories);
  
  // 4. Filter out already borrowed books
  const filtered = filterBorrowedBooks(popularBooks, borrowHistory);
  
  // 5. Add random discoveries
  const discoveries = await getRandomAvailableBooks(2);
  
  return [...filtered.slice(0, 3), ...discoveries];
};
```

#### Search Algorithm
```typescript
const searchBooks = async (query: string, filters: SearchFilters) => {
  let queryBuilder = supabase
    .from('books')
    .select('*')
    .or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`);
    
  if (filters.category) {
    queryBuilder = queryBuilder.eq('category', filters.category);
  }
  
  if (filters.availableOnly) {
    queryBuilder = queryBuilder.gt('available_copies', 0);
  }
  
  return queryBuilder.order('title');
};
```

### Authentication Flow
```typescript
// 1. Sign In Process
const handleSignIn = async (email: string, password: string) => {
  // Authenticate with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) throw error;
  
  // Determine user role
  const role = await determineUserRole(data.user.email);
  
  // Redirect based on role
  if (role === 'student') navigate('/');
  if (role === 'staff') navigate('/staff-landing');
};

// 2. Role Determination
const determineUserRole = async (email: string) => {
  // Check students table
  const student = await supabase.from('students').select('id').eq('email', email).single();
  if (student.data) return 'student';
  
  // Check staff table
  const staff = await supabase.from('staff').select('id').eq('email', email).single();
  if (staff.data) return 'staff';
  
  return null;
};
```

### Real-time Updates
```typescript
// Set up real-time subscriptions for live data
useEffect(() => {
  const subscription = supabase
    .channel('borrow_records')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'borrow_records' },
      (payload) => {
        // Update local state with new data
        handleBorrowRecordChange(payload);
      }
    )
    .subscribe();
    
  return () => subscription.unsubscribe();
}, []);
```

---

## 📊 Sample Data Structure

### Sample Books
```json
[
  {
    "title": "Introduction to Computer Science",
    "author": "John Smith",
    "isbn": "978-0134685991",
    "category": "Technology",
    "description": "Comprehensive guide to computer science fundamentals",
    "available_copies": 5,
    "total_copies": 5,
    "is_digital": true,
    "digital_url": "https://example.com/book1.pdf"
  },
  {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0743273565",
    "category": "Fiction",
    "description": "Classic American novel",
    "available_copies": 3,
    "total_copies": 4
  }
]
```

### Sample Students
```json
[
  {
    "name": "Alice Johnson",
    "email": "alice.johnson@student.klu.ac.in",
    "student_id": "CS2021001",
    "year": "3rd Year",
    "department": "Computer Science",
    "contact": "+91-9876543210"
  },
  {
    "name": "Bob Wilson",
    "email": "bob.wilson@student.klu.ac.in",
    "student_id": "ME2021002",
    "year": "2nd Year",
    "department": "Mechanical Engineering",
    "contact": "+91-9876543211"
  }
]
```

### Sample Staff
```json
[
  {
    "name": "Dr. Sarah Chen",
    "email": "sarah.chen@klu.ac.in",
    "staff_id": "LIB001",
    "department": "Library Services",
    "position": "Head Librarian",
    "username": "sarahc"
  },
  {
    "name": "Michael Rodriguez",
    "email": "michael.rodriguez@klu.ac.in",
    "staff_id": "LIB002",
    "department": "Library Services",
    "position": "Assistant Librarian",
    "username": "michaelr"
  }
]
```

---

## 🔐 Environment Configuration

### Required Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Settings
VITE_DEV_MODE=true
VITE_ENABLE_ANALYTICS=true

# Optional: Custom Branding
VITE_UNIVERSITY_NAME="KL University"
VITE_LIBRARY_NAME="KL SmartLibrary"
```

### Supabase Setup
1. **Create Supabase Project**
   - Sign up at supabase.com
   - Create new project
   - Copy project URL and anon key

2. **Database Setup**
   - Run the provided SQL schema
   - Set up Row Level Security (RLS)
   - Configure storage bucket for book covers

3. **Authentication Setup**
   - Enable email authentication
   - Configure email templates
   - Set up password reset flow

---

## 🚀 Deployment Instructions

### Vercel Deployment
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy project
   vercel --prod
   ```

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Enable Vercel Analytics
   - Configure custom domain (optional)

3. **Build Configuration**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

### Alternative Deployment Options
- **Netlify**: Drag and drop dist folder
- **Firebase Hosting**: Use Firebase CLI
- **AWS S3 + CloudFront**: Static hosting setup

---

## 🧪 Development Setup

### Prerequisites
- Node.js 18+ or Bun
- Git
- Code editor (VS Code recommended)

### Installation Steps
```bash
# Clone repository
git clone <your-repo-url>
cd LibraryManagementSystem

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
# or
bun dev
```

### Development Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

---

## 📋 Dependencies

### Core Dependencies
```json
{
  "@hookform/resolvers": "^3.9.0",
  "@radix-ui/react-*": "Various versions",
  "@react-three/drei": "^9.122.0",
  "@react-three/fiber": "^8.18.0",
  "@supabase/supabase-js": "^2.51.0",
  "@tanstack/react-query": "^5.56.2",
  "@vercel/analytics": "^1.5.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-hook-form": "^7.53.0",
  "react-router-dom": "^6.26.2",
  "recharts": "^2.12.7",
  "tailwindcss": "^3.4.11",
  "typescript": "^5.5.3"
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.3.3",
  "@types/react-dom": "^18.3.0",
  "@vitejs/plugin-react-swc": "^3.5.0",
  "autoprefixer": "^10.4.20",
  "eslint": "^9.9.0",
  "postcss": "^8.4.47",
  "vite": "^5.4.1"
}
```

---

## 🎯 Key Features Implementation

### 1. Role-Based Access Control
```typescript
// Higher-order component for route protection
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole: 'student' | 'staff' }) => {
  const { user, role, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/signin" />;
  if (role !== requiredRole) return <Navigate to="/unauthorized" />;
  
  return <>{children}</>;
};
```

### 2. Real-time Notifications
```typescript
// Toast notification system
const { toast } = useToast();

const showSuccessToast = (message: string) => {
  toast({
    title: "Success!",
    description: message,
    duration: 3000,
  });
};

const showErrorToast = (message: string) => {
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
    duration: 4000,
  });
};
```

### 3. Advanced Search
```typescript
// Multi-field search with filters
const useBookSearch = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    availableOnly: false,
    digitalOnly: false,
  });
  
  const { data: books, isLoading } = useQuery({
    queryKey: ['books', query, filters],
    queryFn: () => searchBooks(query, filters),
    enabled: query.length > 0,
  });
  
  return { books, isLoading, query, setQuery, filters, setFilters };
};
```

### 4. Image Upload System
```typescript
// Book cover upload to Supabase storage
const uploadBookCover = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('book-covers')
    .upload(fileName, file);
    
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('book-covers')
    .getPublicUrl(fileName);
    
  return urlData.publicUrl;
};
```

---

## 🔍 Testing Strategy

### Unit Testing
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Run tests
npm run test
```

### Integration Testing
- Component interaction testing
- API endpoint testing
- Authentication flow testing
- Database query testing

### End-to-End Testing
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Run E2E tests
npm run test:e2e
```

---

## 📈 Performance Optimization

### Code Splitting
```typescript
// Lazy load components
const Analytics = lazy(() => import('./pages/Analytics'));
const ManageBooks = lazy(() => import('./pages/ManageBooks'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <Analytics />
</Suspense>
```

### Image Optimization
```typescript
// Optimized image loading
const OptimizedImage = ({ src, alt, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="transition-opacity duration-200"
      {...props}
    />
  );
};
```

### Database Query Optimization
```typescript
// Efficient data fetching with proper indexing
const useBookCatalog = (category?: string) => {
  return useQuery({
    queryKey: ['books', category],
    queryFn: async () => {
      let query = supabase
        .from('books')
        .select('id, title, author, cover_url, available_copies, category')
        .gt('available_copies', 0);
        
      if (category) {
        query = query.eq('category', category);
      }
      
      return query.order('title');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

---

## 🛡️ Security Considerations

### Row Level Security (RLS)
```sql
-- Students can only see their own records
CREATE POLICY "Students can view own records" ON borrow_records
  FOR SELECT USING (
    student_id = (
      SELECT id FROM students 
      WHERE email = auth.email()
    )
  );

-- Staff can view all records
CREATE POLICY "Staff can view all records" ON borrow_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE email = auth.email()
    )
  );
```

### Input Validation
```typescript
// Zod schema validation
import { z } from 'zod';

const BookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  isbn: z.string().regex(/^[\d-]+$/, 'Invalid ISBN format').optional(),
  category: z.string().min(1, 'Category is required'),
  available_copies: z.number().min(0, 'Cannot be negative'),
});

type Book = z.infer<typeof BookSchema>;
```

### API Rate Limiting
```typescript
// Implement request throttling
const useThrottledRequest = (fn: Function, delay: number) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const throttledFn = useCallback(
    throttle(async (...args) => {
      setIsLoading(true);
      try {
        return await fn(...args);
      } finally {
        setIsLoading(false);
      }
    }, delay),
    [fn, delay]
  );
  
  return { execute: throttledFn, isLoading };
};
```

---

## 📞 Support & Maintenance

### Error Monitoring
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Application error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### Logging System
```typescript
// Structured logging
const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
  },
};
```

---

## 🔄 Version Control & Collaboration

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request
# After review and approval, merge to main
```

### Commit Convention
```
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

---

## 📚 Additional Resources

### Documentation Links
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Community & Support
- GitHub Issues for bug reports
- Discord community for discussions
- Stack Overflow for technical questions
- Official documentation for references

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 👥 Contributors

- **Development Team**: Your development team
- **UI/UX Design**: Design team
- **Project Management**: PM team
- **Quality Assurance**: QA team

---

**Last Updated**: July 31, 2025
**Version**: 1.0.0
**Document Status**: Complete and Ready for Implementation

---

*This documentation provides a comprehensive guide for recreating the Library Management System using lovable.dev or any other development platform. All technical specifications, database schemas, and implementation details are included for exact replication.*
