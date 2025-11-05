import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Image as ImageIcon, Check } from "lucide-react";
import { Link } from "react-router-dom";
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

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
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
        </div>
      </div>
    </div>
  );
};

export default PDFToJPG;
