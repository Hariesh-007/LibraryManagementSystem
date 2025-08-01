import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import SearchResults from "./pages/SearchResults";
import Catalog from "./pages/Catalog_Enhanced";
import BookDetails from "./pages/BookDetails";
import DigitalResources from "./pages/DigitalResources";
import Account from './pages/Account';
import StaffLanding from './pages/StaffLanding';

import { Analytics as VercelAnalytics } from '@vercel/analytics/react';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Navigate to="/student" replace />} />
          <Route path="/student" element={<Account />} />
          <Route path="/staff" element={<StaffLanding />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/digital-resources" element={<DigitalResources />} />
          <Route path="/account" element={<Navigate to="/student" replace />} />
          <Route path="/StaffLanding" element={<Navigate to="/staff" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <VercelAnalytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
