import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Image as ImageIcon, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Animated3DIcon } from "@/components/Animated3DIcon";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const PDFToJPG = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionMode, setConversionMode] = useState<'pages' | 'extract'>('pages');
  const [quality, setQuality] = useState<'low' | 'normal' | 'high'>('high');

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to convert",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      const file = files[0];
      
      toast({
        title: "🚀 Starting Conversion...",
        description: `Converting with ${quality} quality...`,
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', conversionMode);
      formData.append('quality', quality);
      formData.append('zip', 'false');
      
      const response = await fetch('http://localhost:5000/api/convert/pdf-to-jpg', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Conversion failed');
      }
      
      const result = await response.json();
      
      if (result.success && result.images) {
        // Download each image separately
        for (let i = 0; i < result.images.length; i++) {
          const image = result.images[i];
          
          // Convert base64 to blob
          const byteCharacters = atob(image.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j++) {
            byteNumbers[j] = byteCharacters.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });
          
          // Create download link
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = image.filename;
          document.body.appendChild(a);
          
          // Delay between downloads to avoid browser blocking
          await new Promise(resolve => setTimeout(resolve, 100 * i));
          a.click();
          
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        toast({
          title: "✅ Conversion Complete!",
          description: `Downloaded ${result.count} JPG ${result.count === 1 ? 'image' : 'images'} separately`,
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
                color="from-red-500 to-pink-600"
                bgGradient="linear-gradient(135deg, #ef4444, #ec4899)"
              />
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PDF to JPG
            </h1>
            <p className="text-muted-foreground text-lg">
              Convert PDF pages to high-quality JPG images
            </p>
          </div>

          <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <ImageIcon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary mb-1">PDF to JPG Converter</h3>
                <p className="text-sm text-muted-foreground">
                  Convert PDF pages to images or extract embedded images with customizable quality settings.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <FileUpload onFilesSelected={handleFilesSelected} multiple={false} accept=".pdf" />
            
            {files.length > 0 && (
              <>
                <FileList files={files} onRemove={handleRemove} />
                
                <Card className="p-6 bg-muted/50">
                  <h3 className="font-semibold mb-4">PDF to JPG options</h3>
                  
                  <div className="space-y-6">
                    {/* Conversion Mode */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Conversion Mode</Label>
                      <RadioGroup value={conversionMode} onValueChange={(value: any) => setConversionMode(value)}>
                        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                          <RadioGroupItem value="pages" id="mode-pages" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="mode-pages" className="cursor-pointer font-medium flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              PAGE TO JPG
                              {conversionMode === 'pages' && <Check className="w-4 h-4 text-green-600" />}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Every page of this PDF will be converted into a JPG file. 1 JPG will be created.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                          <RadioGroupItem value="extract" id="mode-extract" className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor="mode-extract" className="cursor-pointer font-medium flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              EXTRACT IMAGES
                              {conversionMode === 'extract' && <Check className="w-4 h-4 text-green-600" />}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              All embedded images inside the PDF will be extracted as JPG images.
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Image Quality */}
                    {conversionMode === 'pages' && (
                      <div>
                        <Label className="text-base font-semibold mb-3 block">Image quality</Label>
                        <RadioGroup value={quality} onValueChange={(value: any) => setQuality(value)}>
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                            <RadioGroupItem value="low" id="quality-low" />
                            <Label htmlFor="quality-low" className="cursor-pointer flex-1">
                              Low (150 DPI)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                            <RadioGroupItem value="normal" id="quality-normal" />
                            <Label htmlFor="quality-normal" className="cursor-pointer flex-1">
                              Normal (200 DPI)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                            <RadioGroupItem value="high" id="quality-high" />
                            <Label htmlFor="quality-high" className="cursor-pointer flex-1">
                              High (300 DPI) - Recommended
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </div>
                </Card>
                
                <Button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 h-12 text-lg"
                >
                  {isConverting ? "Converting..." : "Convert to JPG"}
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
                {["🖼️ Convert PDF pages to JPG", "📸 Extract embedded images", "🎯 High-quality output", "⚡ Fast Python backend", "🔒 Secure local processing", "💾 Multiple quality options"].map((feature, index) => (
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
                How to Convert PDF to JPG
              </h2>
              <ol className="space-y-3 sm:space-y-4">
                {[
                  "Upload your PDF file",
                  "Choose conversion mode (pages or extract images)",
                  "Select image quality (if converting pages)",
                  "Click 'Convert to JPG' and download your images"
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

export default PDFToJPG;
