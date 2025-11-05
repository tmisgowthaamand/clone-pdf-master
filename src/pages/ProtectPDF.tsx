import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const ProtectPDF = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleProtect = () => {
    toast({
      title: "Coming Soon",
      description: "PDF protection feature will be available soon!",
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
              Protect PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Protect PDF files with a password to prevent unauthorized access
            </p>
          </div>

          <Card className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950 border-indigo-200">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">Protect PDF</h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  Protect PDF files with a password to prevent unauthorized access.
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
                  onClick={handleProtect}
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 h-12 text-lg"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Protect PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectPDF;
