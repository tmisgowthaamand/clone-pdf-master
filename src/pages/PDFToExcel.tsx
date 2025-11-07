import { useState } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Sheet } from "lucide-react";
import { Link } from "react-router-dom";
import { Animated3DIcon } from "@/components/Animated3DIcon";
import { Card } from "@/components/ui/card";

const PDFToExcel = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handlePythonConversion = async () => {
    if (files.length === 0) return;
    const file = files[0];
    setIsConverting(true);

    try {
      // Show progress with estimated time
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      const estimatedTime = file.size > 5 * 1024 * 1024 ? '1-2 minutes' : '30-45 seconds';
      
      toast({
        title: "🚀 Converting PDF to Excel...",
        description: `Extracting tables, logo, and headers (${fileSizeMB}MB). Estimated: ${estimatedTime}`,
      });

      const formData = new FormData();
      formData.append('file', file);

      // Longer timeout for PDF to Excel (table extraction can be slow)
      const timeoutDuration = file.size > 5 * 1024 * 1024 ? 180000 : 120000; // 3 min or 2 min
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

      const response = await fetch(API_ENDPOINTS.PDF_TO_EXCEL, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        keepalive: true,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Conversion failed' }));
        throw new Error(error.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '.xlsx');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "✅ Success!",
        description: `Bank statement converted with logo, headers, and perfect alignment!`,
      });
    } catch (error: any) {
      let errorMessage = "Failed to convert PDF to Excel";
      
      if (error.name === 'AbortError') {
        errorMessage = "Conversion timeout. Please try a smaller PDF or try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Conversion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to tools
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-6">
              <Animated3DIcon 
                icon={Sheet} 
                color="from-green-500 to-teal-600"
                bgGradient="linear-gradient(135deg, #22c55e, #0d9488)"
              />
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Convert PDF to Excel
            </h1>
            <p className="text-muted-foreground text-lg">
              Extract tables from PDF to Excel spreadsheets
            </p>
          </div>

          <Card className="mb-6 p-4 bg-green-50 dark:bg-green-950 border-green-200">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">PDF to Excel Converter</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Upload a PDF file and convert tables to Excel format.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <FileUpload onFilesSelected={handleFilesSelected} multiple={false} accept=".pdf" />
            
            {files.length > 0 && (
              <>
                <FileList files={files} onRemove={handleRemove} />
                
                <Button
                  onClick={handlePythonConversion}
                  disabled={isConverting}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-12 text-lg"
                >
                  {isConverting ? (
                    "Converting..."
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Convert to Excel
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Features Section */}
          <Card className="mt-8 p-4 sm:p-6 bg-gradient-to-br from-muted/50 to-muted/30 border-2 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
            <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative z-10">
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs sm:text-sm">✨</span>
                Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {["📊 Extract tables from PDF", "🎯 Perfect table extraction", "⚡ Fast Python backend", "🔒 Secure local processing", "💾 Standard XLSX format", "📋 Combines all tables"].map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background/50 hover:bg-background transition-colors duration-200 lg:hover:scale-105 lg:hover:shadow-md group/item"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 lg:group-hover/item:scale-110 transition-transform">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/80 group-hover/item:text-foreground transition-colors">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* How to Convert Steps */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl sm:rounded-2xl border-2 relative overflow-hidden">
            <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg text-sm sm:text-base">
                  📋
                </span>
                How to Convert PDF to Excel
              </h2>
              <ol className="space-y-3 sm:space-y-4">
                {[
                  "Upload your PDF file with tables",
                  "Click 'Convert to Excel' button",
                  "Wait for the conversion process",
                  "Download your Excel spreadsheet"
                ].map((step, index) => (
                  <li 
                    key={index} 
                    className="flex gap-3 sm:gap-4 items-start group lg:hover:translate-x-2 transition-transform duration-300"
                  >
                    <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-base sm:text-lg font-bold shadow-lg lg:group-hover:scale-110 lg:group-hover:rotate-6 transition-all duration-300">
                      {index + 1}
                    </span>
                    <div className="flex-1 pt-1 sm:pt-2">
                      <span className="text-sm sm:text-base text-foreground font-medium group-hover:text-primary transition-colors">{step}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFToExcel;
