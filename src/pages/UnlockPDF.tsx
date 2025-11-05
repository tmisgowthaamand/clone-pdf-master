import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Unlock } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const UnlockPDF = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUnlock = () => {
    toast({
      title: "Coming Soon",
      description: "PDF unlock feature will be available soon!",
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
              Unlock PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Remove PDF password security, giving you freedom to use your PDFs
            </p>
          </div>

          <Card className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-950 border-cyan-200">
            <div className="flex items-start gap-3">
              <Unlock className="h-5 w-5 text-cyan-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-1">Unlock PDF</h3>
                <p className="text-sm text-cyan-700 dark:text-cyan-300">
                  Remove PDF password security, giving you freedom to use your PDFs.
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
                  onClick={handleUnlock}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 h-12 text-lg"
                >
                  <Unlock className="w-5 h-5 mr-2" />
                  Unlock PDF
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockPDF;
