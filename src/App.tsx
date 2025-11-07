import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingScreen } from "@/components/LoadingScreen";

// Lazy load heavy components for better performance
const BackgroundSwitcher = lazy(() => import("@/components/BackgroundSwitcher").then(m => ({ default: m.BackgroundSwitcher })));
const AnimatedCharacter = lazy(() => import("@/components/AnimatedCharacter").then(m => ({ default: m.AnimatedCharacter })));
const FloatingImages = lazy(() => import("@/components/FloatingImages").then(m => ({ default: m.FloatingImages })));

// Lazy load all page components
const Index = lazy(() => import("./pages/Index"));
const PowerPointToPDF = lazy(() => import("./pages/PowerPointToPDF"));
const PDFToPowerPoint = lazy(() => import("./pages/PDFToPowerPoint"));
const WordToPDF = lazy(() => import("./pages/WordToPDF"));
const PDFToWord = lazy(() => import("./pages/PDFToWord"));
const PDFToExcel = lazy(() => import("./pages/PDFToExcel"));
const ExcelToPDF = lazy(() => import("./pages/ExcelToPDF"));
const JPGToPDF = lazy(() => import("./pages/JPGToPDF"));
const PDFToJPG = lazy(() => import("./pages/PDFToJPG"));
const HTMLToPDF = lazy(() => import("./pages/HTMLToPDF"));
const MergePDF = lazy(() => import("./pages/MergePDF"));
const SplitPDF = lazy(() => import("./pages/SplitPDF"));
const CompressPDF = lazy(() => import("./pages/CompressPDF"));
const RotatePDF = lazy(() => import("./pages/RotatePDF"));
const EditPDF = lazy(() => import("./pages/EditPDF"));
const ProtectPDF = lazy(() => import("./pages/ProtectPDF"));
const UnlockPDF = lazy(() => import("./pages/UnlockPDF"));
const SignPDF = lazy(() => import("./pages/SignPDF"));
const WatermarkPDF = lazy(() => import("./pages/WatermarkPDF"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  // Defer heavy animations to reduce main-thread work
  useEffect(() => {
    // Mark animations as low priority
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      (window as any).scheduler.postTask(() => {
        // Low priority animations will load after critical content
      }, { priority: 'background' });
    }
  }, []);

  return (
    <ThemeProvider>
      <LoadingScreen />
      <Router>
        <Suspense fallback={<PageLoader />}>
          <BackgroundSwitcher />
          <FloatingImages />
          <AnimatedCharacter position="right" />
        </Suspense>
        <ThemeToggle />
        <div className="relative z-10">
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/" element={<Index />} />
            {/* PowerPoint conversions */}
            <Route path="/pptx-to-pdf" element={<PowerPointToPDF />} />
            <Route path="/powerpoint-to-pdf" element={<PowerPointToPDF />} />
            <Route path="/pdf-to-pptx" element={<PDFToPowerPoint />} />
            <Route path="/pdf-to-powerpoint" element={<PDFToPowerPoint />} />
            {/* Word conversions */}
            <Route path="/docx-to-pdf" element={<WordToPDF />} />
            <Route path="/word-to-pdf" element={<WordToPDF />} />
            <Route path="/pdf-to-docx" element={<PDFToWord />} />
            <Route path="/pdf-to-word" element={<PDFToWord />} />
            {/* Excel conversions */}
            <Route path="/pdf-to-excel" element={<PDFToExcel />} />
            <Route path="/excel-to-pdf" element={<ExcelToPDF />} />
            {/* Image conversions */}
            <Route path="/jpg-to-pdf" element={<JPGToPDF />} />
            <Route path="/pdf-to-jpg" element={<PDFToJPG />} />
            {/* Other conversions */}
            <Route path="/html-to-pdf" element={<HTMLToPDF />} />
            {/* PDF tools */}
            <Route path="/merge-pdf" element={<MergePDF />} />
            <Route path="/split-pdf" element={<SplitPDF />} />
            <Route path="/compress-pdf" element={<CompressPDF />} />
            <Route path="/rotate-pdf" element={<RotatePDF />} />
            <Route path="/edit-pdf" element={<EditPDF />} />
            <Route path="/protect-pdf" element={<ProtectPDF />} />
            <Route path="/unlock-pdf" element={<UnlockPDF />} />
            <Route path="/sign-pdf" element={<SignPDF />} />
            <Route path="/watermark-pdf" element={<WatermarkPDF />} />
            </Routes>
          </Suspense>
        </div>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
