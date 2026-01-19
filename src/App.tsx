
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Hotel from "./pages/Hotel";
import HotelAdmin from "./pages/HotelAdmin";
import HotelDashboard from "./pages/HotelDashboard";
import Rooms from "./pages/Rooms";
import FloorPlan from "./pages/FloorPlan";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/hotel-admin" element={<HotelAdmin />} />
          <Route path="/hotel/dashboard" element={<HotelDashboard />} />
          <Route path="/hotel" element={<Hotel />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/floorplan" element={<FloorPlan />} />
          <Route path="/payment" element={<Payment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;