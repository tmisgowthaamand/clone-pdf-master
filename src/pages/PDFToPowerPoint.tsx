import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const PDFToPowerPoint = () => {
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
      toast({
        title: "🚀 Starting Conversion...",
        description: "Converting PDF to PowerPoint...",
      });

      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:5000/api/convert/pdf-to-pptx', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '.pptx');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "✅ Conversion Complete!",
        description: "PDF converted to PowerPoint successfully",
      });
      
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
              Convert PDF to PowerPoint
            </h1>
            <p className="text-muted-foreground text-lg">
              Transform PDF pages into PowerPoint slides
            </p>
          </div>

          <Card className="mb-6 p-4 bg-orange-50 dark:bg-orange-950 border-orange-200">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">PDF to PowerPoint Converter</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Upload a PDF file and convert it to a PowerPoint presentation.
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
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-12 text-lg"
                >
                  {isConverting ? (
                    "Converting..."
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Convert to PowerPoint
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

export default PDFToPowerPoint;
