import { BookOpen, Users, ClipboardList, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StaffHeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 text-center bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-100">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-6">
          <span className="inline-flex items-center justify-center bg-white rounded-full shadow-lg p-4 mr-3">
            <BookOpen className="h-12 w-12 text-indigo-500" />
          </span>
          <span className="text-4xl md:text-5xl font-bold text-indigo-800 drop-shadow">Staff Portal</span>
        </div>
        <p className="text-lg md:text-2xl mb-8 text-indigo-700 max-w-2xl mx-auto font-medium">
          Welcome to the KL SmartLibrary Staff Dashboard.<br />
          Manage book returns, oversee borrowing activity, and access library analytics—all in one place.
        </p>
        <div className="flex flex-wrap gap-8 justify-center mt-8">
          <div
            className="flex flex-col items-center bg-white rounded-xl shadow-md px-6 py-4 cursor-pointer hover:bg-indigo-50 transition"
            onClick={() => navigate('/staff/approve-returns')}
            title="Approve Returns"
          >
            <ClipboardList className="h-8 w-8 text-indigo-500 mb-2" />
            <span className="font-semibold text-indigo-800">Approve Returns</span>
            <span className="text-indigo-700 text-sm mt-1">Review and approve book return requests from students quickly and efficiently.</span>
          </div>
          <div
            className="flex flex-col items-center bg-white rounded-xl shadow-md px-6 py-4 cursor-pointer hover:bg-indigo-50 transition"
            onClick={() => navigate('/staff/borrowing')}
            title="Oversee Borrowing"
          >
            <Users className="h-8 w-8 text-indigo-500 mb-2" />
            <span className="font-semibold text-indigo-800">Oversee Borrowing</span>
            <span className="text-indigo-700 text-sm mt-1">Monitor all active and overdue borrows to ensure smooth library operations.</span>
          </div>
          <div
            className="flex flex-col items-center bg-white rounded-xl shadow-md px-6 py-4 cursor-pointer hover:bg-indigo-50 transition"
            onClick={() => navigate('/staff/analytics')}
            title="View Analytics"
          >
            <BarChart3 className="h-8 w-8 text-indigo-500 mb-2" />
            <span className="font-semibold text-indigo-800">View Analytics</span>
            <span className="text-indigo-700 text-sm mt-1">Access insights and reports on library usage and borrowing trends.</span>
          </div>
          <div
            className="flex flex-col items-center bg-white rounded-xl shadow-md px-6 py-4 cursor-pointer hover:bg-indigo-50 transition"
            onClick={() => navigate('/staff/manage-books')}
            title="Manage Books (Coming Soon)"
          >
            <BookOpen className="h-8 w-8 text-indigo-500 mb-2" />
            <span className="font-semibold text-indigo-800">Manage Books (Coming Soon)</span>
            <span className="text-indigo-700 text-sm mt-1">Add, update, or remove books from the library collection (feature coming soon).</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaffHeroSection; 