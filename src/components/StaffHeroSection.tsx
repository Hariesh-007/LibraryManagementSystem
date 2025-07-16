import { BookOpen, Users, ClipboardList, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const StaffHeroSection = () => {
  const goToDashboard = () => {
    window.location.href = '/staff-dashboard';
  };
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
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button variant="accent" size="lg" className="shadow-glow bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 hover:from-indigo-600 hover:to-purple-600" onClick={goToDashboard}>
            Go to Staff Dashboard
          </Button>
        </div>
        <div className="flex flex-wrap gap-8 justify-center mt-8">
          <div
            className="flex flex-col items-center bg-white rounded-xl shadow-md px-6 py-4 cursor-pointer hover:bg-indigo-50 transition"
            onClick={goToDashboard}
            title="Go to Approve Returns section"
          >
            <ClipboardList className="h-8 w-8 text-indigo-500 mb-2" />
            <span className="font-semibold text-indigo-800">Approve Returns</span>
          </div>
          <div className="flex flex-col items-center bg-white rounded-xl shadow-md px-6 py-4">
            <Users className="h-8 w-8 text-indigo-500 mb-2" />
            <span className="font-semibold text-indigo-800">Oversee Borrowing</span>
          </div>
          <div className="flex flex-col items-center bg-white rounded-xl shadow-md px-6 py-4">
            <BarChart3 className="h-8 w-8 text-indigo-500 mb-2" />
            <span className="font-semibold text-indigo-800">View Analytics</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaffHeroSection; 