import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Users, BarChart3, BookOpen } from "lucide-react";

const staffFeatures = [
  {
    icon: <ClipboardList className="h-8 w-8 text-indigo-500" />, 
    title: "Approve Returns",
    description: "Review and approve book return requests from students quickly and efficiently.",
  },
  {
    icon: <Users className="h-8 w-8 text-indigo-500" />,
    title: "Oversee Borrowing",
    description: "Monitor all active and overdue borrows to ensure smooth library operations.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-indigo-500" />,
    title: "View Analytics",
    description: "Access insights and reports on library usage and borrowing trends.",
  },
  {
    icon: <BookOpen className="h-8 w-8 text-indigo-500" />,
    title: "Manage Books (Coming Soon)",
    description: "Add, update, or remove books from the library collection (feature coming soon).",
  },
];

const StaffFeaturesSection = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-indigo-800 mb-10 text-center drop-shadow">Staff Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {staffFeatures.map((feature, idx) => (
            <Card key={feature.title} className="hover:shadow-glow transition-bounce bg-white border-0 shadow-md">
              <CardHeader className="flex flex-col items-center">
                {feature.icon}
                <CardTitle className="text-lg text-indigo-800 text-center mt-2 font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-indigo-700 text-sm font-medium">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StaffFeaturesSection; 