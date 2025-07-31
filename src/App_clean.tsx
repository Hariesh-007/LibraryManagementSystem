import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import SearchResults from "./pages/SearchResults";
import Catalog from "./pages/Catalog";
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
          <Route path="/" element={<Index />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/digital-resources" element={<DigitalResources />} />
          <Route path="/account" element={<Account />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/StaffLanding" element={<StaffLanding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <VercelAnalytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
