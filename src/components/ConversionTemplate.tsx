import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, CheckCircle2, Cloud, Laptop } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ConversionTemplateProps {
  title: string;
  description: string;
  acceptedFormats: string;
  infoText: string;
  cloudFunctionName: string;
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
  cloudFunctionName,
  onClientConversion,
  features,
  steps,
  forceCloudConversion = false
}: ConversionTemplateProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [conversionMethod, setConversionMethod] = useState<'cloud' | 'client'>(
    forceCloudConversion === false ? 'client' : 
    ((import.meta as any)?.env?.VITE_API_BASE_URL ? 'cloud' : (isSupabaseConfigured ? 'cloud' : 'client'))
  );
  const { toast } = useToast();
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const convertCloud = async (file: File) => {
    try {
      if (API_BASE) {
        const formData = new FormData();
        formData.append('file', file);
        const endpoint = API_BASE.replace(/\/$/, '') + '/api/convert';
        const resp = await fetch(endpoint, { method: 'POST', body: formData });
        if (!resp.ok) {
          const msg = await resp.text();
          throw new Error(msg || 'Server conversion failed');
        }
        const data: any = await resp.json();
        if (data?.downloadUrl) {
          const response = await fetch(data.downloadUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = data.fileName || file.name.replace(/\.(pptx?|ppt)$/i, '.pdf');
          link.click();
          URL.revokeObjectURL(url);
          toast({
            title: "Success!",
            description: `File converted using server processing. Downloaded as ${link.download}`,
          });
          return;
        }
        throw new Error('No download URL returned');
      } else {
        // Use direct fetch to the Edge Function endpoint
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase configuration is missing');
        }

        const formData = new FormData();
        formData.append('file', file);

        const functionUrl = `${supabaseUrl}/functions/v1/${cloudFunctionName}`;
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Edge Function error: ${errorText}`);
        }

        const data = await response.json();
        
        if (data?.downloadUrl) {
          // Storage-based download
          const pdfResponse = await fetch(data.downloadUrl);
          const blob = await pdfResponse.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = data.fileName;
          link.click();
          URL.revokeObjectURL(url);
          toast({
            title: "✅ Success!",
            description: `File converted using cloud processing. Downloaded as ${data.fileName}`,
          });
        } else if (data?.pdfData && data?.direct) {
          // Direct PDF data (base64)
          const binaryString = atob(data.pdfData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = data.fileName;
          link.click();
          URL.revokeObjectURL(url);
          toast({
            title: "✅ Success!",
            description: `Professional PDF generated! Downloaded as ${data.fileName}`,
          });
        } else {
          throw new Error('No download data in response');
        }
      }
    } catch (error) {
      throw error;
    }
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

    if ((forceCloudConversion || conversionMethod === 'cloud') && !isSupabaseConfigured) {
      toast({
        title: "Cloud Conversion Not Configured",
        description: "Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const file = files[0];

      if (forceCloudConversion === false) {
        // Force client-side conversion only
        await onClientConversion(file);
      } else if ((forceCloudConversion || conversionMethod === 'cloud') && isSupabaseConfigured) {
        await convertCloud(file);
      } else {
        await onClientConversion(file);
      }
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
                  {!forceCloudConversion && (
                    <>
                      <h3 className="font-semibold mb-4">Conversion Method</h3>
                      <RadioGroup value={conversionMethod} onValueChange={(value) => setConversionMethod(value as 'cloud' | 'client')}>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                            <RadioGroupItem value="cloud" id="cloud-conv" disabled={!isSupabaseConfigured} />
                            <div className="flex-1">
                              <Label htmlFor="cloud-conv" className="flex items-center gap-2 font-medium cursor-pointer">
                                <Cloud className="w-4 h-4" />
                                Cloud Processing {!isSupabaseConfigured && '(Not Configured)'}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Uses Supabase Edge Functions for server-side conversion.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                            <RadioGroupItem value="client" id="client-conv" />
                            <div className="flex-1">
                              <Label htmlFor="client-conv" className="flex items-center gap-2 font-medium cursor-pointer">
                                <Laptop className="w-4 h-4" />
                                Client-Side Processing
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Processes files in your browser. Works offline.
                              </p>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                    </>
                  )}
                  
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
