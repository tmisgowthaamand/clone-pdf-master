import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface ConversionTemplateProps {
  title: string;
  description: string;
  acceptedFormats: string;
  infoText: string;
  cloudFunctionName?: string;
  onClientConversion: (file: File) => Promise<void>;
  features: string[];
  steps: string[];
  forceCloudConversion?: boolean;
}

export const ConversionTemplate = ({
  title,
  description,
  acceptedFormats,
  infoText,
  onClientConversion,
  features,
  steps,
}: ConversionTemplateProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

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
        description: "Please select a file to convert",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const file = files[0];
      await onClientConversion(file);
    } catch (error) {
      console.error('Error converting file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert file';
      toast({
        title: "Conversion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
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
              {title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {description}
            </p>
          </div>

          <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary mb-1">Conversion Info</h3>
                <p className="text-sm text-muted-foreground">
                  {infoText}
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <FileUpload onFilesSelected={handleFilesSelected} multiple={false} accept={acceptedFormats} />
            
            {files.length > 0 && (
              <>
                <FileList files={files} onRemove={handleRemove} />
                
                <Card className="p-6 bg-muted/50">
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-semibold mb-2 text-sm">Features</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                          <p>{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
                
                <Button
                  onClick={handleConvert}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg"
                >
                  {processing ? (
                    "Converting..."
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Convert File
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          <div className="mt-12 p-6 bg-muted/30 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How to Convert</h2>
            <ol className="space-y-3 text-muted-foreground">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
