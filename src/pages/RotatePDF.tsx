import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RotateCw, RotateCcw, Download, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Animated3DIcon } from "@/components/Animated3DIcon";
import { Card } from "@/components/ui/card";
import { API_ENDPOINTS } from '@/config/api';
import { downloadBlob } from "@/utils/downloadHelper";

const RotatePDF = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      const url = URL.createObjectURL(newFiles[0]);
      setPdfPreview(url);
    }
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (pdfPreview) {
      URL.revokeObjectURL(pdfPreview);
      setPdfPreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (pdfPreview) URL.revokeObjectURL(pdfPreview);
    };
  }, [pdfPreview]);

  const getRotationDegrees = () => {
    if (rotation === 0) return 0;
    if (direction === 'left') {
      return 360 - rotation;
    }
    return rotation;
  };

  const handleRotate = async () => {
    if (files.length === 0) return;
    
    if (rotation === 0) {
      toast({
        title: "⚠️ No Rotation Selected",
        description: "Please select a rotation angle (90°, 180°, or 270°)",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('rotation', rotation.toString());
      formData.append('direction', direction);

      toast({
        title: "🔄 Processing...",
        description: "Rotating your PDF...",
      });

      const response = await fetch(API_ENDPOINTS.PDF_ROTATE, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Rotation failed');
      }

      const blob = await response.blob();
      const filename = file.name.replace(/\.pdf$/i, '_rotated.pdf');
      downloadBlob(blob, filename);

      toast({
        title: "✅ Success",
        description: "PDF rotated and downloaded successfully",
      });
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Rotation error:', error);
      setIsProcessing(false);
      
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : 'Failed to rotate PDF',
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
            <div className="flex justify-center mb-6">
              <Animated3DIcon 
                icon={RotateCw} 
                color="from-pink-500 to-rose-600"
                bgGradient="linear-gradient(135deg, #ec4899, #e11d48)"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Rotate PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Rotate your PDFs the way you need them. You can rotate pages individually
            </p>
          </div>

          <Card className="mb-6 p-4 bg-pink-50 dark:bg-pink-950 border-pink-200">
            <div className="flex items-start gap-3">
              <RotateCw className="h-5 w-5 text-pink-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-pink-900 dark:text-pink-100 mb-1">Rotate PDF</h3>
                <p className="text-sm text-pink-700 dark:text-pink-300">
                  Rotate your PDFs the way you need them. You can rotate pages individually.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <FileUpload onFilesSelected={handleFilesSelected} multiple={false} accept=".pdf" />
            
            {files.length > 0 && (
              <>
                <FileList files={files} onRemove={handleRemove} />
                
                {/* PDF Preview with Rotation */}
                {pdfPreview && (
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">Preview</h3>
                      <span className="text-sm text-muted-foreground ml-auto">
                        Rotation: {getRotationDegrees()}° {direction === 'right' ? '↻' : '↺'}
                      </span>
                    </div>
                    <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center" style={{ height: '500px' }}>
                      <div 
                        className="transition-transform duration-300 ease-in-out"
                        style={{ 
                          transform: `rotate(${getRotationDegrees()}deg)`,
                          maxWidth: rotation === 90 || rotation === 270 ? '500px' : '100%',
                          maxHeight: rotation === 90 || rotation === 270 ? '100%' : '500px',
                        }}
                      >
                        <iframe
                          src={pdfPreview}
                          className="border-2 border-primary rounded"
                          style={{
                            width: rotation === 90 || rotation === 270 ? '500px' : '100%',
                            height: rotation === 90 || rotation === 270 ? '700px' : '500px',
                          }}
                          title="PDF Preview"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center mt-3">
                      Preview shows how your PDF will look after rotation
                    </p>
                  </Card>
                )}
                
                <Card className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold">Rotation Settings</h3>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Rotation Direction</div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button
                        type="button"
                        variant={direction === 'right' ? 'default' : 'outline'}
                        onClick={() => setDirection('right')}
                        className="h-20"
                      >
                        <RotateCw className="w-6 h-6 mr-2" />
                        Rotate Right (Clockwise)
                      </Button>
                      <Button
                        type="button"
                        variant={direction === 'left' ? 'default' : 'outline'}
                        onClick={() => setDirection('left')}
                        className="h-20"
                      >
                        <RotateCcw className="w-6 h-6 mr-2" />
                        Rotate Left (Counter-clockwise)
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Rotation Angle</div>
                    <div className="grid grid-cols-4 gap-3 mt-2">
                      <Button
                        type="button"
                        variant={rotation === 0 ? 'default' : 'outline'}
                        onClick={() => setRotation(0)}
                      >
                        No Rotation
                      </Button>
                      <Button
                        type="button"
                        variant={rotation === 90 ? 'default' : 'outline'}
                        onClick={() => setRotation(90)}
                      >
                        90°
                      </Button>
                      <Button
                        type="button"
                        variant={rotation === 180 ? 'default' : 'outline'}
                        onClick={() => setRotation(180)}
                      >
                        180°
                      </Button>
                      <Button
                        type="button"
                        variant={rotation === 270 ? 'default' : 'outline'}
                        onClick={() => setRotation(270)}
                      >
                        270°
                      </Button>
                    </div>
                  </div>
                </Card>
                
                <Button 
                  onClick={handleRotate}
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isProcessing ? 'Rotating...' : 'Rotate & Download PDF'}
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
                {["🔄 Rotate 90°, 180°, or 270°", "📄 All pages or specific pages", "⚡ Fast processing", "🔒 Secure local rotation", "💾 Download rotated PDF", "🎯 Maintains quality"].map((feature, index) => (
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

          {/* How to Rotate Steps */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl sm:rounded-2xl border-2 relative overflow-hidden">
            <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg text-sm sm:text-base">
                  📋
                </span>
                How to Rotate PDF
              </h2>
              <ol className="space-y-3 sm:space-y-4">
                {[
                  "Upload your PDF file",
                  "Select rotation angle (90°, 180°, or 270°)",
                  "Choose to rotate all pages or specific pages",
                  "Click 'Rotate & Download PDF'"
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

export default RotatePDF;
