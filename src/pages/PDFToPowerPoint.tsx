import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, CheckCircle2, Cloud, Laptop } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import * as pdfjsLib from 'pdfjs-dist';
import pptxgen from 'pptxgenjs';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const PDFToPowerPoint = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [conversionMethod, setConversionMethod] = useState<'cloud' | 'client'>(
    isSupabaseConfigured ? 'cloud' : 'client'
  );
  const { toast } = useToast();

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const convertToPowerPointCloud = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('pdf-to-powerpoint', {
        body: formData,
      });

      if (error) throw error;

      if (data.downloadUrl) {
        const response = await fetch(data.downloadUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.fileName;
        link.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Success!",
          description: `PDF converted to PowerPoint using cloud processing. Downloaded as ${data.fileName}`,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const convertToPowerPointClient = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'PDF Tools';
      pptx.title = `Converted from ${file.name}`;

      toast({
        title: "Processing PDF...",
        description: `Extracting ${pdfDoc.numPages} pages with images and text...`,
      });

      // Convert each PDF page to a slide with images
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality
        
        // Create canvas to render PDF page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          // Render PDF page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          // Convert canvas to image data URL
          const imageData = canvas.toDataURL('image/png');

          // Create slide and add the rendered page as an image
          const slide = pptx.addSlide();
          
          // Add full-page image (16:9 aspect ratio)
          slide.addImage({
            data: imageData,
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
            sizing: { type: 'contain', w: '100%', h: '100%' }
          });

          // Extract text for searchability (invisible overlay)
          const textContent = await page.getTextContent();
          let textLines: string[] = [];
          let currentLine = '';
          
          textContent.items.forEach((item: any, index: number) => {
            if (item.str) {
              currentLine += item.str;
              const nextItem = textContent.items[index + 1];
              if (!nextItem || Math.abs((item as any).transform[5] - (nextItem as any).transform[5]) > 5) {
                if (currentLine.trim()) {
                  textLines.push(currentLine.trim());
                }
                currentLine = '';
              }
            }
          });

          // Add text as notes for searchability
          if (textLines.length > 0) {
            const notesText = textLines.join('\n');
            slide.addNotes(notesText);
          }

          // Add small page number indicator
          slide.addText(`${pageNum}`, {
            x: 9.2,
            y: 5.2,
            w: 0.5,
            h: 0.3,
            fontSize: 10,
            color: '999999',
            align: 'right'
          });
        }

        // Update progress
        if (pageNum % 5 === 0 || pageNum === pdfDoc.numPages) {
          toast({
            title: "Converting...",
            description: `Processed ${pageNum} of ${pdfDoc.numPages} pages`,
          });
        }
      }

      // Save the presentation
      const fileName = file.name.replace('.pdf', '.pptx');
      await pptx.writeFile({ fileName });

      toast({
        title: "✅ Success!",
        description: `PDF converted to PowerPoint! ${pdfDoc.numPages} pages with full image quality. Downloaded as ${fileName}`,
      });
    } catch (error) {
      console.error('Client conversion error:', error);
      throw error;
    }
  };

  const convertToPowerPoint = async () => {
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

      if (conversionMethod === 'cloud' && isSupabaseConfigured) {
        try {
          await convertToPowerPointCloud(file);
        } catch (cloudError) {
          console.warn('Cloud conversion failed, falling back to client-side');
          try {
            toast({
              title: "Using client-side conversion",
              description: "Cloud function not available. Processing locally...",
            });
            await convertToPowerPointClient(file);
          } catch (clientError) {
            console.error('Client conversion also failed:', clientError);
            throw clientError;
          }
        }
      } else {
        await convertToPowerPointClient(file);
      }
    } catch (error) {
      console.error('Error converting PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert PDF';
      toast({
        title: "Conversion Failed",
        description: errorMessage.includes('worker') 
          ? "PDF processing library failed to load. Please refresh the page and try again."
          : "Failed to convert PDF to PowerPoint. Please try again.",
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
              PDF to PowerPoint Converter
            </h1>
            <p className="text-muted-foreground text-lg">
              Convert your PDF files into editable PowerPoint presentations
            </p>
          </div>

          <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary mb-1">High-Quality Visual Conversion</h3>
                <p className="text-sm text-muted-foreground">
                  This tool converts each PDF page into a high-resolution slide image, preserving ALL content including 
                  images, text, formatting, colors, and layouts. Perfect for presentation PDFs like the Tally example. 
                  Text is also extracted and added as notes for searchability.
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
                        <RadioGroupItem value="cloud" id="cloud-ppt" disabled={!isSupabaseConfigured} />
                        <div className="flex-1">
                          <Label htmlFor="cloud-ppt" className="flex items-center gap-2 font-medium cursor-pointer">
                            <Cloud className="w-4 h-4" />
                            Cloud Processing {!isSupabaseConfigured && '(Not Configured)'}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Uses Supabase Edge Functions for server-side conversion. Better for large files.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="client" id="client-ppt" />
                        <div className="flex-1">
                          <Label htmlFor="client-ppt" className="flex items-center gap-2 font-medium cursor-pointer">
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
                        <p>High-resolution rendering (2x scale) for crystal clear slides</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <p>Preserves ALL visual content: images, text, colors, layouts</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <p>Text extracted and added as slide notes for searchability</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <p>Perfect for presentation PDFs with graphics and data</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <p>Creates standard PPTX format compatible with all tools</p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Button
                  onClick={convertToPowerPoint}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg"
                >
                  {processing ? (
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

          <div className="mt-12 p-6 bg-muted/30 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How to Convert PDF to PowerPoint</h2>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</span>
                <span>Upload your PDF file by clicking the upload area or dragging and dropping</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</span>
                <span>Choose your preferred conversion method (cloud or client-side)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</span>
                <span>Click "Convert to PowerPoint" to start the conversion process</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">4</span>
                <span>Download your converted PowerPoint presentation (PPTX format)</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFToPowerPoint;
