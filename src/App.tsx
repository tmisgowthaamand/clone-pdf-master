import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MergePDF from "./pages/MergePDF";
import SplitPDF from "./pages/SplitPDF";
import CompressPDF from "./pages/CompressPDF";
import PDFToWord from "./pages/PDFToWord";
import PDFToPowerPoint from "./pages/PDFToPowerPoint";
import PDFToExcel from "./pages/PDFToExcel";
import WordToPDF from "./pages/WordToPDF";
import PowerPointToPDF from "./pages/PowerPointToPDF";
import ExcelToPDF from "./pages/ExcelToPDF";
import PDFToJPG from "./pages/PDFToJPG";
import JPGToPDF from "./pages/JPGToPDF";
import EditPDF from "./pages/EditPDF";
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
          <Route path="/merge-pdf" element={<MergePDF />} />
          <Route path="/split-pdf" element={<SplitPDF />} />
          <Route path="/compress-pdf" element={<CompressPDF />} />
          <Route path="/pdf-to-word" element={<PDFToWord />} />
          <Route path="/pdf-to-powerpoint" element={<PDFToPowerPoint />} />
          <Route path="/pdf-to-excel" element={<PDFToExcel />} />
          <Route path="/word-to-pdf" element={<WordToPDF />} />
          <Route path="/powerpoint-to-pdf" element={<PowerPointToPDF />} />
          <Route path="/excel-to-pdf" element={<ExcelToPDF />} />
          <Route path="/pdf-to-jpg" element={<PDFToJPG />} />
          <Route path="/jpg-to-pdf" element={<JPGToPDF />} />
          <Route path="/edit-pdf" element={<EditPDF />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
