import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";
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
              Compress PDF File
            </h1>
            <p className="text-muted-foreground text-lg">
              Reduce PDF file size while maintaining quality
            </p>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default CompressPDF;
