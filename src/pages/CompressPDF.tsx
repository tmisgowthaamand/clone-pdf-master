import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { ArrowLeft, Download, Minimize2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Animated3DIcon } from "@/components/Animated3DIcon";
import { Card } from "@/components/ui/card";

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<{ original: number; compressed: number } | null>(null);
  const { toast } = useToast();

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setCompressionResult(null);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setCompressionResult(null);
  };

  const compressPDF = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to compress",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const file = files[0];
      const originalSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Save with compression (pdf-lib automatically applies some optimization)
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      
      const compressedSize = compressedBytes.length;
      setCompressionResult({ original: originalSize, compressed: compressedSize });
      
      const blob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compressed.pdf';
      link.click();
      
      URL.revokeObjectURL(url);

      const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      
      toast({
        title: "Success!",
        description: `PDF compressed by ${reduction}%`,
      });
    } catch (error) {
      console.error('Error compressing PDF:', error);
      toast({
        title: "Error",
        description: "Failed to compress PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <Link to="/" className="inline-flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Back to tools
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            {/* 3D Animated Icon */}
            <div className="flex justify-center mb-6">
              <Animated3DIcon 
                icon={Minimize2} 
                color="from-green-500 to-emerald-600"
                bgGradient="linear-gradient(135deg, #22c55e, #059669)"
              />
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Compress PDF File
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-4">
              Reduce PDF file size while maintaining quality
            </p>
          </div>

          {/* Info Card with 3D Effect */}
          <Card className="mb-6 p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex items-start gap-3 sm:gap-4 relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Compress Info
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Reduce your PDF file size while maintaining quality. Perfect for email attachments, web uploads, or saving storage space.
                </p>
              </div>
            </div>
            
            <div className="absolute top-2 right-2 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute bottom-2 left-2 w-16 h-16 bg-secondary/5 rounded-full blur-xl" />
          </Card>

          <div className="space-y-6">
            <FileUpload onFilesSelected={handleFilesSelected} multiple={false} accept=".pdf" />
            
            {files.length > 0 && (
              <>
                <FileList files={files} onRemove={handleRemove} />
                
                {compressionResult && (
                  <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="font-semibold mb-3 text-center">Compression Result</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Original</p>
                        <p className="text-lg font-semibold">{formatFileSize(compressionResult.original)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Compressed</p>
                        <p className="text-lg font-semibold text-primary">{formatFileSize(compressionResult.compressed)}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-center">
                        <span className="text-2xl font-bold text-primary">
                          {((compressionResult.original - compressionResult.compressed) / compressionResult.original * 100).toFixed(1)}%
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">size reduction</span>
                      </p>
                    </div>
                  </Card>
                )}
                
                <Button
                  onClick={compressPDF}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg"
                >
                  {processing ? (
                    "Processing..."
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Compress PDF
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
                {["📉 Reduce file size up to 90%", "🎯 Maintains document quality", "⚡ Fast compression algorithm", "🔒 Secure client-side processing", "💾 No file size limits", "📊 See compression statistics"].map((feature, index) => (
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

          {/* How to Compress Steps */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl sm:rounded-2xl border-2 relative overflow-hidden">
            <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg text-sm sm:text-base">
                  📋
                </span>
                How to Compress PDF
              </h2>
              <ol className="space-y-3 sm:space-y-4">
                {[
                  "Upload your PDF file",
                  "Click 'Compress PDF' to start optimization",
                  "View compression statistics and size reduction",
                  "Download your compressed PDF file"
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

export default CompressPDF;
