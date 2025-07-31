-- =============================================
-- Library Management System Database Setup
-- Complete Schema for Supabase PostgreSQL
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. STUDENTS TABLE
-- =============================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    year TEXT,
    department TEXT,
    contact TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. STAFF TABLE
-- =============================================
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    staff_id TEXT UNIQUE NOT NULL,
    department TEXT DEFAULT 'Library Services',
    username TEXT UNIQUE,
    position TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. BOOKS TABLE
-- =============================================
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    available_copies INTEGER DEFAULT 1 CHECK (available_copies >= 0),
    total_copies INTEGER DEFAULT 1 CHECK (total_copies >= 0),
    is_digital BOOLEAN DEFAULT FALSE,
    digital_url TEXT,
    publication_year INTEGER,
    publisher TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. BORROW RECORDS TABLE
-- =============================================
CREATE TABLE borrow_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE NULL,
    status TEXT DEFAULT 'borrowed' CHECK (
        status IN ('pending', 'approved', 'borrowed', 'return_requested', 'returned', 'rejected', 'overdue')
    ),
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. RESERVATIONS TABLE
-- =============================================
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'reserved' CHECK (
        status IN ('reserved', 'waitlisted', 'fulfilled', 'cancelled')
    ),
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- =============================================
-- 6. WISHLISTS TABLE
-- =============================================
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- =============================================
-- 7. READING GOALS TABLE
-- =============================================
CREATE TABLE reading_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    target_books INTEGER DEFAULT 12 CHECK (target_books > 0),
    current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, year)
);

-- =============================================
-- 8. BOOK RATINGS TABLE
-- =============================================
CREATE TABLE book_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, book_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Borrow records indexes
CREATE INDEX idx_borrow_records_student_id ON borrow_records(student_id);
CREATE INDEX idx_borrow_records_book_id ON borrow_records(book_id);
CREATE INDEX idx_borrow_records_status ON borrow_records(status);
CREATE INDEX idx_borrow_records_due_at ON borrow_records(due_at);
CREATE INDEX idx_borrow_records_borrowed_at ON borrow_records(borrowed_at);

-- Books indexes
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_available_copies ON books(available_copies);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);

-- Students indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_student_id ON students(student_id);

-- Staff indexes
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_staff_id ON staff(staff_id);

-- Reservations indexes
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Wishlists indexes
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_book_id ON wishlists(book_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_ratings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STUDENTS TABLE POLICIES
-- =============================================

-- Students can view their own record
CREATE POLICY "Students can view own record" ON students
    FOR SELECT USING (email = auth.email());

-- Students can update their own record
CREATE POLICY "Students can update own record" ON students
    FOR UPDATE USING (email = auth.email());

-- Staff can view all student records
CREATE POLICY "Staff can view all students" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE email = auth.email()
        )
    );

-- =============================================
-- STAFF TABLE POLICIES
-- =============================================

-- Staff can view their own record
CREATE POLICY "Staff can view own record" ON staff
    FOR SELECT USING (email = auth.email());

-- Staff can update their own record
CREATE POLICY "Staff can update own record" ON staff
    FOR UPDATE USING (email = auth.email());

-- Staff can view other staff records
CREATE POLICY "Staff can view all staff" ON staff
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE email = auth.email()
        )
    );

-- =============================================
-- BOOKS TABLE POLICIES
-- =============================================

-- Anyone can view books (public access)
CREATE POLICY "Anyone can view books" ON books
    FOR SELECT USING (true);

-- Only staff can insert books
CREATE POLICY "Staff can insert books" ON books
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE email = auth.email()
        )
    );

-- Only staff can update books
CREATE POLICY "Staff can update books" ON books
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE email = auth.email()
        )
    );

-- Only staff can delete books
CREATE POLICY "Staff can delete books" ON books
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE email = auth.email()
        )
    );

-- =============================================
-- BORROW RECORDS TABLE POLICIES
-- =============================================

-- Students can view their own borrow records
CREATE POLICY "Students can view own borrow records" ON borrow_records
    FOR SELECT USING (
        student_id = (
            SELECT id FROM students 
            WHERE email = auth.email()
        )
    );

-- Students can insert their own borrow records
CREATE POLICY "Students can create borrow records" ON borrow_records
    FOR INSERT WITH CHECK (
        student_id = (
            SELECT id FROM students 
            WHERE email = auth.email()
        )
    );

-- Students can update their own borrow records (for return requests)
CREATE POLICY "Students can update own borrow records" ON borrow_records
    FOR UPDATE USING (
        student_id = (
            SELECT id FROM students 
            WHERE email = auth.email()
        )
    );

-- Staff can view all borrow records
CREATE POLICY "Staff can view all borrow records" ON borrow_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE email = auth.email()
        )
    );

-- =============================================
-- RESERVATIONS TABLE POLICIES
-- =============================================

-- Users can view their own reservations
CREATE POLICY "Users can view own reservations" ON reservations
    FOR SELECT USING (
        user_id = auth.uid() OR
        user_id::text = (
            SELECT id::text FROM students 
            WHERE email = auth.email()
        )
    );

-- Users can create their own reservations
CREATE POLICY "Users can create reservations" ON reservations
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR
        user_id::text = (
            SELECT id::text FROM students 
            WHERE email = auth.email()
        )
    );

-- Users can update their own reservations
CREATE POLICY "Users can update own reservations" ON reservations
    FOR UPDATE USING (
        user_id = auth.uid() OR
        user_id::text = (
            SELECT id::text FROM students 
            WHERE email = auth.email()
        )
    );

-- Staff can view all reservations
CREATE POLICY "Staff can view all reservations" ON reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE email = auth.email()
        )
    );

-- =============================================
-- WISHLISTS TABLE POLICIES
-- =============================================

-- Users can manage their own wishlists
CREATE POLICY "Users can manage own wishlists" ON wishlists
    FOR ALL USING (
        user_id = auth.uid() OR
        user_id::text = (
            SELECT id::text FROM students 
            WHERE email = auth.email()
        )
    );

-- =============================================
-- READING GOALS TABLE POLICIES
-- =============================================

-- Students can manage their own reading goals
CREATE POLICY "Students can manage own reading goals" ON reading_goals
    FOR ALL USING (
        student_id = (
            SELECT id FROM students 
            WHERE email = auth.email()
        )
    );

-- Staff can view all reading goals
CREATE POLICY "Staff can view all reading goals" ON reading_goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE email = auth.email()
        )
    );

-- =============================================
-- BOOK RATINGS TABLE POLICIES
-- =============================================

-- Students can manage their own ratings
CREATE POLICY "Students can manage own ratings" ON book_ratings
    FOR ALL USING (
        student_id = (
            SELECT id FROM students 
            WHERE email = auth.email()
        )
    );

-- Anyone can view ratings (for book recommendations)
CREATE POLICY "Anyone can view ratings" ON book_ratings
    FOR SELECT USING (true);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_borrow_records_updated_at BEFORE UPDATE ON borrow_records
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_reading_goals_updated_at BEFORE UPDATE ON reading_goals
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_book_ratings_updated_at BEFORE UPDATE ON book_ratings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert sample students
INSERT INTO students (name, email, student_id, year, department, contact) VALUES
('Alice Johnson', 'alice.johnson@student.klu.ac.in', 'CS2021001', '3rd Year', 'Computer Science', '+91-9876543210'),
('Bob Wilson', 'bob.wilson@student.klu.ac.in', 'ME2021002', '2nd Year', 'Mechanical Engineering', '+91-9876543211'),
('Carol Davis', 'carol.davis@student.klu.ac.in', 'EE2021003', '4th Year', 'Electrical Engineering', '+91-9876543212'),
('David Brown', 'david.brown@student.klu.ac.in', 'CE2021004', '1st Year', 'Civil Engineering', '+91-9876543213'),
('Eva Martinez', 'eva.martinez@student.klu.ac.in', 'CS2021005', '2nd Year', 'Computer Science', '+91-9876543214');

-- Insert sample staff
INSERT INTO staff (name, email, staff_id, department, username, position) VALUES
('Dr. Sarah Chen', 'sarah.chen@klu.ac.in', 'LIB001', 'Library Services', 'sarahc', 'Head Librarian'),
('Michael Rodriguez', 'michael.rodriguez@klu.ac.in', 'LIB002', 'Library Services', 'michaelr', 'Assistant Librarian'),
('Dr. Priya Sharma', 'priya.sharma@klu.ac.in', 'LIB003', 'Library Services', 'priyas', 'Digital Resources Manager'),
('James Anderson', 'james.anderson@klu.ac.in', 'LIB004', 'Library Services', 'jamesa', 'Circulation Manager');

-- Insert sample books
INSERT INTO books (title, author, isbn, category, description, available_copies, total_copies, is_digital, digital_url) VALUES
-- Technology/Computer Science Books
('Introduction to Computer Science', 'John Smith', '978-0134685991', 'Technology', 'Comprehensive guide to computer science fundamentals covering programming, algorithms, and data structures.', 5, 5, true, 'https://example.com/cs-intro.pdf'),
('Data Structures and Algorithms', 'Jane Doe', '978-0262033848', 'Technology', 'Advanced concepts in data structures and algorithmic thinking for computer science students.', 3, 4, false, null),
('Web Development Fundamentals', 'Mike Johnson', '978-1491914250', 'Technology', 'Learn HTML, CSS, JavaScript and modern web development practices.', 4, 4, true, 'https://example.com/web-dev.pdf'),
('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0136042594', 'Technology', 'Comprehensive introduction to AI concepts and applications.', 2, 3, false, null),
('Database Systems Concepts', 'Abraham Silberschatz', '978-0078022159', 'Technology', 'Fundamental concepts of database design and management.', 3, 3, true, 'https://example.com/database.pdf'),

-- Mathematics Books
('Calculus: Early Transcendentals', 'James Stewart', '978-1285741550', 'Mathematics', 'Comprehensive calculus textbook for engineering and science students.', 6, 8, false, null),
('Linear Algebra and Its Applications', 'David Lay', '978-0321982384', 'Mathematics', 'Essential concepts of linear algebra with practical applications.', 4, 5, true, 'https://example.com/linear-algebra.pdf'),
('Probability and Statistics', 'Jay Devore', '978-1305251809', 'Mathematics', 'Introduction to probability theory and statistical analysis.', 5, 6, false, null),
('Discrete Mathematics', 'Kenneth Rosen', '978-0077431440', 'Mathematics', 'Mathematical foundations for computer science including logic, sets, and graph theory.', 3, 4, true, 'https://example.com/discrete-math.pdf'),

-- Science Books
('Physics for Scientists and Engineers', 'Raymond Serway', '978-1337553278', 'Science', 'Comprehensive physics textbook covering mechanics, thermodynamics, and electromagnetism.', 7, 10, false, null),
('Chemistry: The Central Science', 'Theodore Brown', '978-0134414232', 'Science', 'General chemistry principles and applications.', 5, 6, true, 'https://example.com/chemistry.pdf'),
('Biology: The Unity and Diversity of Life', 'Cecie Starr', '978-1305073951', 'Science', 'Comprehensive introduction to biological concepts and diversity.', 4, 5, false, null),
('Environmental Science', 'G. Tyler Miller', '978-1305090446', 'Science', 'Study of environmental systems and sustainability.', 3, 4, true, 'https://example.com/env-science.pdf'),

-- Literature and Fiction
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'Fiction', 'Classic American novel about the Jazz Age and the American Dream.', 8, 10, true, 'https://example.com/gatsby.pdf'),
('To Kill a Mockingbird', 'Harper Lee', '978-0060935467', 'Fiction', 'Timeless story of racial injustice and moral growth in the American South.', 6, 8, false, null),
('1984', 'George Orwell', '978-0451524935', 'Fiction', 'Dystopian novel about totalitarianism and surveillance.', 5, 7, true, 'https://example.com/1984.pdf'),
('Pride and Prejudice', 'Jane Austen', '978-0141439518', 'Fiction', 'Classic romance novel about love, marriage, and social class.', 4, 5, false, null),
('The Catcher in the Rye', 'J.D. Salinger', '978-0316769174', 'Fiction', 'Coming-of-age story about teenage alienation and identity.', 3, 4, true, 'https://example.com/catcher.pdf'),

-- History Books
('A People''s History of the United States', 'Howard Zinn', '978-0062397348', 'History', 'Alternative perspective on American history from the viewpoint of ordinary people.', 4, 5, false, null),
('The Guns of August', 'Barbara Tuchman', '978-0345476098', 'History', 'Detailed account of the first month of World War I.', 3, 3, true, 'https://example.com/guns-august.pdf'),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '978-0062316097', 'History', 'Exploration of human evolution and the development of civilization.', 5, 6, false, null),
('The Silk Roads', 'Peter Frankopan', '978-1101912379', 'History', 'History of the world through the lens of trade routes and cultural exchange.', 2, 3, true, 'https://example.com/silk-roads.pdf'),

-- Business and Economics
('Principles of Economics', 'N. Gregory Mankiw', '978-1305585126', 'Business', 'Introduction to microeconomic and macroeconomic principles.', 6, 8, false, null),
('The Lean Startup', 'Eric Ries', '978-0307887894', 'Business', 'Modern approach to building and scaling startups efficiently.', 4, 5, true, 'https://example.com/lean-startup.pdf'),
('Good to Great', 'Jim Collins', '978-0066620992', 'Business', 'Research-based insights on what makes companies excel.', 3, 4, false, null),
('Freakonomics', 'Steven Levitt', '978-0060731328', 'Business', 'Economic analysis of unexpected social phenomena.', 5, 6, true, 'https://example.com/freakonomics.pdf');

-- Insert sample borrow records
INSERT INTO borrow_records (student_id, book_id, borrowed_at, due_at, status) VALUES
-- Active borrows
((SELECT id FROM students WHERE student_id = 'CS2021001'), (SELECT id FROM books WHERE title = 'Introduction to Computer Science'), NOW() - INTERVAL '5 days', NOW() + INTERVAL '9 days', 'borrowed'),
((SELECT id FROM students WHERE student_id = 'CS2021001'), (SELECT id FROM books WHERE title = 'The Great Gatsby'), NOW() - INTERVAL '3 days', NOW() + INTERVAL '11 days', 'borrowed'),
((SELECT id FROM students WHERE student_id = 'ME2021002'), (SELECT id FROM books WHERE title = 'Calculus: Early Transcendentals'), NOW() - INTERVAL '2 days', NOW() + INTERVAL '12 days', 'borrowed'),
((SELECT id FROM students WHERE student_id = 'EE2021003'), (SELECT id FROM books WHERE title = 'Physics for Scientists and Engineers'), NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days', 'borrowed'),

-- Return requested
((SELECT id FROM students WHERE student_id = 'CE2021004'), (SELECT id FROM books WHERE title = 'Chemistry: The Central Science'), NOW() - INTERVAL '12 days', NOW() + INTERVAL '2 days', 'return_requested'),

-- Returned books
((SELECT id FROM students WHERE student_id = 'CS2021005'), (SELECT id FROM books WHERE title = 'Data Structures and Algorithms'), NOW() - INTERVAL '20 days', NOW() - INTERVAL '6 days', 'returned'),
((SELECT id FROM students WHERE student_id = 'CS2021001'), (SELECT id FROM books WHERE title = '1984'), NOW() - INTERVAL '25 days', NOW() - INTERVAL '11 days', 'returned'),

-- Overdue books
((SELECT id FROM students WHERE student_id = 'ME2021002'), (SELECT id FROM books WHERE title = 'To Kill a Mockingbird'), NOW() - INTERVAL '18 days', NOW() - INTERVAL '4 days', 'borrowed');

-- Update returned_at for returned books
UPDATE borrow_records 
SET returned_at = NOW() - INTERVAL '6 days'
WHERE status = 'returned' AND returned_at IS NULL;

-- Insert sample reservations
INSERT INTO reservations (user_id, book_id, status, expires_at) VALUES
((SELECT id FROM students WHERE student_id = 'CS2021005'), (SELECT id FROM books WHERE title = 'Artificial Intelligence: A Modern Approach'), 'reserved', NOW() + INTERVAL '3 days'),
((SELECT id FROM students WHERE student_id = 'EE2021003'), (SELECT id FROM books WHERE title = 'The Lean Startup'), 'waitlisted', NULL),
((SELECT id FROM students WHERE student_id = 'CE2021004'), (SELECT id FROM books WHERE title = 'Web Development Fundamentals'), 'reserved', NOW() + INTERVAL '2 days');

-- Insert sample wishlists
INSERT INTO wishlists (user_id, book_id) VALUES
((SELECT id FROM students WHERE student_id = 'CS2021001'), (SELECT id FROM books WHERE title = 'Sapiens: A Brief History of Humankind')),
((SELECT id FROM students WHERE student_id = 'CS2021001'), (SELECT id FROM books WHERE title = 'The Lean Startup')),
((SELECT id FROM students WHERE student_id = 'ME2021002'), (SELECT id FROM books WHERE title = 'Good to Great')),
((SELECT id FROM students WHERE student_id = 'EE2021003'), (SELECT id FROM books WHERE title = 'Freakonomics')),
((SELECT id FROM students WHERE student_id = 'CS2021005'), (SELECT id FROM books WHERE title = 'Pride and Prejudice'));

-- Insert sample reading goals
INSERT INTO reading_goals (student_id, year, target_books, current_progress) VALUES
((SELECT id FROM students WHERE student_id = 'CS2021001'), 2024, 15, 8),
((SELECT id FROM students WHERE student_id = 'ME2021002'), 2024, 12, 5),
((SELECT id FROM students WHERE student_id = 'EE2021003'), 2024, 20, 12),
((SELECT id FROM students WHERE student_id = 'CE2021004'), 2024, 10, 3),
((SELECT id FROM students WHERE student_id = 'CS2021005'), 2024, 18, 9);

-- Insert sample book ratings
INSERT INTO book_ratings (student_id, book_id, rating, review) VALUES
((SELECT id FROM students WHERE student_id = 'CS2021001'), (SELECT id FROM books WHERE title = '1984'), 5, 'Incredible dystopian novel that feels very relevant today. Orwell''s vision is both terrifying and thought-provoking.'),
((SELECT id FROM students WHERE student_id = 'CS2021005'), (SELECT id FROM books WHERE title = 'Data Structures and Algorithms'), 4, 'Excellent technical book for computer science students. Clear explanations and good examples.'),
((SELECT id FROM students WHERE student_id = 'ME2021002'), (SELECT id FROM books WHERE title = 'To Kill a Mockingbird'), 5, 'Powerful story about justice and morality. A must-read classic that remains relevant.'),
((SELECT id FROM students WHERE student_id = 'EE2021003'), (SELECT id FROM books WHERE title = 'The Great Gatsby'), 4, 'Beautiful prose and compelling characters. Great insight into the American Dream and its disillusionment.');

-- =============================================
-- STORAGE BUCKET SETUP (Run this in Supabase Dashboard)
-- =============================================

-- Note: This needs to be done in the Supabase Dashboard Storage section
-- 1. Create a bucket named 'book-covers'
-- 2. Set it to public
-- 3. Add policies for uploads

-- Storage policies (add these through the dashboard or API):
-- INSERT policy: Allow authenticated users to upload
-- SELECT policy: Allow public read access
-- UPDATE policy: Allow users to update their own uploads
-- DELETE policy: Allow users to delete their own uploads

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify table creation
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check sample data
SELECT 'Students' as table_name, count(*) as record_count FROM students
UNION ALL
SELECT 'Staff', count(*) FROM staff
UNION ALL
SELECT 'Books', count(*) FROM books
UNION ALL
SELECT 'Borrow Records', count(*) FROM borrow_records
UNION ALL
SELECT 'Reservations', count(*) FROM reservations
UNION ALL
SELECT 'Wishlists', count(*) FROM wishlists
UNION ALL
SELECT 'Reading Goals', count(*) FROM reading_goals
UNION ALL
SELECT 'Book Ratings', count(*) FROM book_ratings;

-- =============================================
-- USEFUL QUERIES FOR TESTING
-- =============================================

-- View active borrows with student and book details
SELECT 
    s.name as student_name,
    s.student_id,
    b.title as book_title,
    br.borrowed_at,
    br.due_at,
    br.status,
    CASE 
        WHEN br.due_at < NOW() AND br.returned_at IS NULL THEN 
            ROUND((EXTRACT(epoch FROM (NOW() - br.due_at)) / 86400) * 0.50, 2)
        ELSE 0 
    END as fine_amount
FROM borrow_records br
JOIN students s ON br.student_id = s.id
JOIN books b ON br.book_id = b.id
WHERE br.returned_at IS NULL
ORDER BY br.borrowed_at DESC;

-- View book availability and popularity
SELECT 
    b.title,
    b.author,
    b.category,
    b.available_copies,
    b.total_copies,
    COUNT(br.id) as total_borrows,
    AVG(rat.rating) as average_rating
FROM books b
LEFT JOIN borrow_records br ON b.id = br.book_id
LEFT JOIN book_ratings rat ON b.id = rat.book_id
GROUP BY b.id, b.title, b.author, b.category, b.available_copies, b.total_copies
ORDER BY total_borrows DESC;

-- View student reading statistics
SELECT 
    s.name,
    s.student_id,
    COUNT(CASE WHEN br.returned_at IS NOT NULL THEN 1 END) as books_read,
    COUNT(CASE WHEN br.returned_at IS NULL THEN 1 END) as current_borrows,
    rg.target_books,
    rg.current_progress
FROM students s
LEFT JOIN borrow_records br ON s.id = br.student_id
LEFT JOIN reading_goals rg ON s.id = rg.student_id AND rg.year = 2024
GROUP BY s.id, s.name, s.student_id, rg.target_books, rg.current_progress
ORDER BY books_read DESC;

-- =============================================
-- COMPLETED SUCCESSFULLY
-- =============================================

SELECT 'Database setup completed successfully!' as message,
       'Tables created: 8' as tables,
       'Sample records inserted' as data,
       'RLS policies enabled' as security,
       'Ready for application use' as status;
