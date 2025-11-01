import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, CheckCircle2, Cloud, Laptop } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const PDFToWord = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  // Default to client-side if cloud is not configured
  const [conversionMethod, setConversionMethod] = useState<'cloud' | 'client'>(
    isSupabaseConfigured ? 'cloud' : 'client'
  );
  const { toast } = useToast();

  // Set up PDF.js worker
  useEffect(() => {
    // Use unpkg CDN which is more reliable
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const convertToWordCloud = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('pdf-to-word', {
        body: formData,
      });

      if (error) throw error;

      if (data.downloadUrl) {
        // Download the file from Supabase storage
        const response = await fetch(data.downloadUrl);
        const blob = await response.blob();
        saveAs(blob, data.fileName);

        toast({
          title: "Success!",
          description: `PDF converted to Word using cloud processing. Downloaded as ${data.fileName}`,
        });
      }
    } catch (error) {
      // Silently throw error to be handled by fallback
      throw error;
    }
  };

  const convertToWordClient = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      
      const paragraphs: Paragraph[] = [];
      
      // Add title
      paragraphs.push(
        new Paragraph({
          text: `Converted from: ${file.name}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      );
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Add page header
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Page ${pageNum}`,
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 300, after: 100 },
          })
        );
        
        // Extract and add text items
        let currentLine = '';
        textContent.items.forEach((item: any, index: number) => {
          if (item.str) {
            currentLine += item.str;
            
            // Check if this is the end of a line
            const nextItem = textContent.items[index + 1];
            if (!nextItem || (nextItem as any).hasEOL || 
                Math.abs((item as any).transform[5] - (nextItem as any).transform[5]) > 5) {
              if (currentLine.trim()) {
                paragraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: currentLine.trim(),
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                );
              }
              currentLine = '';
            }
          }
        });
        
        // Add any remaining text
        if (currentLine.trim()) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: currentLine.trim(),
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }
      }
      
      // Create Word document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });
      
      // Generate and save the document
      const blob = await Packer.toBlob(doc);
      const fileName = file.name.replace('.pdf', '.docx');
      saveAs(blob, fileName);
      
      toast({
        title: "Success!",
        description: `PDF converted to Word using client-side processing. Downloaded as ${fileName}`,
      });
      
    } catch (error) {
      console.error('Client conversion error:', error);
      throw error;
    }
  };

  const convertToWord = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to convert",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const file = files[0];

      // Try cloud conversion first if selected and configured
      if (conversionMethod === 'cloud' && isSupabaseConfigured) {
        try {
          await convertToWordCloud(file);
        } catch (cloudError) {
          console.warn('Cloud conversion failed, falling back to client-side');
          // Try client-side as fallback
          try {
            toast({
              title: "Using client-side conversion",
              description: "Cloud function not available. Processing locally...",
            });
            await convertToWordClient(file);
          } catch (clientError) {
            console.error('Client conversion also failed:', clientError);
            throw clientError; // Re-throw to be caught by outer catch
          }
        }
      } else {
        // Use client-side conversion
        await convertToWordClient(file);
      }
    } catch (error) {
      console.error('Error converting PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert PDF';
      toast({
        title: "Conversion Failed",
        description: errorMessage.includes('worker') 
          ? "PDF processing library failed to load. Please refresh the page and try again."
          : "Failed to convert PDF. Please try again.",
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
              PDF to Word Converter
            </h1>
            <p className="text-muted-foreground text-lg">
              Convert your PDF files into editable Word documents
            </p>
          </div>

          <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary mb-1">Text-Based Conversion</h3>
                <p className="text-sm text-muted-foreground">
                  This tool extracts text content from your PDF and converts it to an editable Word document (DOCX). 
                  Works best with text-based PDFs. Scanned PDFs or images may not convert properly.
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
                  <h3 className="font-semibold mb-4">Conversion Method</h3>
                  <RadioGroup value={conversionMethod} onValueChange={(value) => setConversionMethod(value as 'cloud' | 'client')}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="cloud" id="cloud" disabled={!isSupabaseConfigured} />
                        <div className="flex-1">
                          <Label htmlFor="cloud" className="flex items-center gap-2 font-medium cursor-pointer">
                            <Cloud className="w-4 h-4" />
                            Cloud Processing {!isSupabaseConfigured && '(Not Configured)'}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Uses Supabase Edge Functions for server-side conversion. Better for large files.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="client" id="client" />
                        <div className="flex-1">
                          <Label htmlFor="client" className="flex items-center gap-2 font-medium cursor-pointer">
                            <Laptop className="w-4 h-4" />
                            Client-Side Processing
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Processes the PDF in your browser. No data sent to server. Works offline.
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-semibold mb-2 text-sm">Features</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <p>Preserves text formatting and layout</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <p>Extracts text content from PDFs</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <p>Creates editable DOCX format</p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Button
                  onClick={convertToWord}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg"
                >
                  {processing ? (
                    "Converting..."
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Convert to Word
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          <div className="mt-12 p-6 bg-muted/30 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How to Convert PDF to Word</h2>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</span>
                <span>Upload your PDF file by clicking the upload area or dragging and dropping</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</span>
                <span>Review your file and conversion options</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</span>
                <span>Click "Convert to Word" to start the conversion process</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">4</span>
                <span>Download your converted Word document (DOCX format)</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFToWord;
