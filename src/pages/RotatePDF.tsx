import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const RotatePDF = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleRotate = () => {
    toast({
      title: "Coming Soon",
      description: "PDF rotation feature will be available soon!",
    });
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
                
                <Button
                  onClick={handleRotate}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 h-12 text-lg"
                >
                  <RotateCw className="w-5 h-5 mr-2" />
                  Rotate Pages
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatePDF;
