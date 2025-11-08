import { useState } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Animated3DIcon } from "@/components/Animated3DIcon";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { downloadBlob } from "@/utils/downloadHelper";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const JPGToPDF = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageSize, setPageSize] = useState<string>('A4');
  const [margin, setMargin] = useState<'no' | 'small' | 'big'>('no');
  const [mergeAll, setMergeAll] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select JPG/JPEG images to convert",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      toast({
        title: "🚀 Starting Conversion...",
        description: `Converting ${files.length} image${files.length > 1 ? 's' : ''} to PDF...`,
      });

      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('orientation', orientation);
      formData.append('pageSize', pageSize);
      formData.append('margin', margin);
      formData.append('mergeAll', mergeAll.toString());
      
      const response = await fetch(API_ENDPOINTS.JPG_TO_PDF, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Conversion failed');
      }
      
      const result = await response.json();
      
      if (result.success && result.pdfs) {
        // Download each PDF separately
        for (let i = 0; i < result.pdfs.length; i++) {
          const pdf = result.pdfs[i];
          
          // Convert base64 to blob
          const byteCharacters = atob(pdf.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j++) {
            byteNumbers[j] = byteCharacters.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          
          // Delay between downloads to avoid browser blocking
          await new Promise(resolve => setTimeout(resolve, 100 * i));
          downloadBlob(blob, pdf.filename);
        }

        toast({
          title: "✅ Conversion Complete!",
          description: `Downloaded ${result.count} PDF ${result.count === 1 ? 'file' : 'files'} separately`,
        });
      } else {
        throw new Error('Invalid response from server');
      }
      
      setIsConverting(false);
    } catch (error) {
      console.error('Conversion error:', error);
      setIsConverting(false);
      
      toast({
        title: "❌ Conversion Failed",
        description: error instanceof Error ? error.message : 'Make sure Python backend is running on port 5000',
        variant: "destructive",
      });
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
                icon={ImageIcon} 
                color="from-blue-500 to-cyan-600"
                bgGradient="linear-gradient(135deg, #3b82f6, #0891b2)"
              />
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              JPG to PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Convert JPG, PNG, and other images to PDF documents
            </p>
          </div>

          <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary mb-1">JPG to PDF Converter</h3>
                <p className="text-sm text-muted-foreground">
                  Convert multiple JPG/JPEG images to PDF. Each image creates a separate PDF file with 300 DPI quality.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <FileUpload 
              onFilesSelected={handleFilesSelected} 
              multiple={true} 
              accept=".jpg,.jpeg,.png" 
            />
            
            {files.length > 0 && (
              <>
                <FileList files={files} onRemove={handleRemove} />
                
                <Card className="p-6 bg-muted/50">
                  <h3 className="font-semibold mb-4 text-lg">Image to PDF options</h3>
                  
                  <div className="space-y-6">
                    {/* Page Orientation */}
                    <div>
                      <div className="text-base font-semibold mb-3 block">Page orientation</div>
                      <RadioGroup value={orientation} onValueChange={(value: any) => setOrientation(value)}>
                        <div className="grid grid-cols-2 gap-3">
                          <div 
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              orientation === 'portrait' 
                                ? 'border-red-500 bg-red-50 dark:bg-red-950' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setOrientation('portrait')}
                          >
                            <RadioGroupItem value="portrait" id="orient-portrait" className="sr-only" />
                            <div className="w-12 h-16 border-2 border-gray-400 rounded mb-2 bg-white"></div>
                            <Label htmlFor="orient-portrait" className="cursor-pointer font-medium">
                              Portrait
                            </Label>
                          </div>
                          <div 
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              orientation === 'landscape' 
                                ? 'border-red-500 bg-red-50 dark:bg-red-950' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setOrientation('landscape')}
                          >
                            <RadioGroupItem value="landscape" id="orient-landscape" className="sr-only" />
                            <div className="w-16 h-12 border-2 border-gray-400 rounded mb-2 bg-white"></div>
                            <Label htmlFor="orient-landscape" className="cursor-pointer font-medium">
                              Landscape
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Page Size */}
                    <div>
                      <div className="text-base font-semibold mb-3 block">Page size</div>
                      <Select value={pageSize} onValueChange={setPageSize}>
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Select page size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4 (297x210 mm)</SelectItem>
                          <SelectItem value="Letter">Letter (279x216 mm)</SelectItem>
                          <SelectItem value="Legal">Legal (356x216 mm)</SelectItem>
                          <SelectItem value="fit">Fit to image size</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Margin */}
                    <div>
                      <div className="text-base font-semibold mb-3 block">Margin</div>
                      <RadioGroup value={margin} onValueChange={(value: any) => setMargin(value)}>
                        <div className="grid grid-cols-3 gap-3">
                          <div 
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              margin === 'no' 
                                ? 'border-red-500 bg-red-50 dark:bg-red-950' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setMargin('no')}
                          >
                            <RadioGroupItem value="no" id="margin-no" className="sr-only" />
                            <div className="relative w-12 h-12 mb-2">
                              <div className="absolute inset-0 border-2 border-gray-400 rounded bg-red-100"></div>
                            </div>
                            <Label htmlFor="margin-no" className="cursor-pointer text-sm font-medium">
                              No margin
                            </Label>
                          </div>
                          <div 
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              margin === 'small' 
                                ? 'border-red-500 bg-red-50 dark:bg-red-950' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setMargin('small')}
                          >
                            <RadioGroupItem value="small" id="margin-small" className="sr-only" />
                            <div className="relative w-12 h-12 mb-2">
                              <div className="absolute inset-0 border-2 border-gray-400 rounded"></div>
                              <div className="absolute inset-1 bg-red-100 rounded-sm"></div>
                            </div>
                            <Label htmlFor="margin-small" className="cursor-pointer text-sm font-medium">
                              Small
                            </Label>
                          </div>
                          <div 
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              margin === 'big' 
                                ? 'border-red-500 bg-red-50 dark:bg-red-950' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setMargin('big')}
                          >
                            <RadioGroupItem value="big" id="margin-big" className="sr-only" />
                            <div className="relative w-12 h-12 mb-2">
                              <div className="absolute inset-0 border-2 border-gray-400 rounded"></div>
                              <div className="absolute inset-2 bg-red-100 rounded-sm"></div>
                            </div>
                            <Label htmlFor="margin-big" className="cursor-pointer text-sm font-medium">
                              Big
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Merge All Option */}
                    {files.length > 1 && (
                      <div className="flex items-center space-x-3 p-4 border-2 rounded-lg bg-background">
                        <Checkbox 
                          id="merge-all" 
                          checked={mergeAll}
                          onCheckedChange={(checked) => setMergeAll(checked as boolean)}
                          className="h-5 w-5"
                        />
                        <Label htmlFor="merge-all" className="cursor-pointer font-medium">
                          Merge all images in one PDF file
                        </Label>
                      </div>
                    )}
                  </div>
                </Card>
                
                <Button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 h-12 text-lg"
                >
                  {isConverting ? "Converting..." : `Convert ${files.length} Image${files.length > 1 ? 's' : ''} to PDF`}
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
                {["🖼️ Convert JPG/PNG to PDF", "📄 Multiple images support", "🎯 High-quality 300 DPI", "⚡ Fast Python backend", "🔒 Secure local processing", "📋 Merge or separate PDFs"].map((feature, index) => (
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
                How to Convert JPG to PDF
              </h2>
              <ol className="space-y-3 sm:space-y-4">
                {[
                  "Upload your JPG/PNG image files",
                  "Choose page orientation and size",
                  "Select whether to merge all images or create separate PDFs",
                  "Click 'Convert' and download your PDF files"
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

export default JPGToPDF;
