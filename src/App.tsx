import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BackgroundSwitcher } from "@/components/BackgroundSwitcher";
import { AnimatedCharacter } from "@/components/AnimatedCharacter";
import { FloatingImages } from "@/components/FloatingImages";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingScreen } from "@/components/LoadingScreen";
import Index from "./pages/Index";
import PowerPointToPDF from "./pages/PowerPointToPDF";
import PDFToPowerPoint from "./pages/PDFToPowerPoint";
import WordToPDF from "./pages/WordToPDF";
import PDFToWord from "./pages/PDFToWord";
import PDFToExcel from "./pages/PDFToExcel";
import ExcelToPDF from "./pages/ExcelToPDF";
import JPGToPDF from "./pages/JPGToPDF";
import PDFToJPG from "./pages/PDFToJPG";
import HTMLToPDF from "./pages/HTMLToPDF";
import MergePDF from "./pages/MergePDF";
import SplitPDF from "./pages/SplitPDF";
import CompressPDF from "./pages/CompressPDF";
import RotatePDF from "./pages/RotatePDF";
import EditPDF from "./pages/EditPDF";
import ProtectPDF from "./pages/ProtectPDF";
import UnlockPDF from "./pages/UnlockPDF";
import SignPDF from "./pages/SignPDF";
import WatermarkPDF from "./pages/WatermarkPDF";

function App() {
  return (
    <ThemeProvider>
      <LoadingScreen />
      <Router>
        <BackgroundSwitcher />
        <FloatingImages />
        <AnimatedCharacter position="right" />
        <ThemeToggle />
        <div className="relative z-10">
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
        </div>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
