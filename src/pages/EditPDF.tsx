import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Type, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';

const EditPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [textToAdd, setTextToAdd] = useState('');
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

  const handleEditPDF = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to edit",
        variant: "destructive",
      });
      return;
    }

    if (!textToAdd.trim()) {
      toast({
        title: "No text entered",
        description: "Please enter text to add to the PDF",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      const { width, height } = firstPage.getSize();
      
      firstPage.drawText(textToAdd, {
        x: 50,
        y: height - 50,
        size: 14,
        color: rgb(0, 0, 0),
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace('.pdf', '-edited.pdf');
      link.click();
      
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: `PDF edited successfully. Downloaded as ${file.name.replace('.pdf', '-edited.pdf')}`,
      });
    } catch (error) {
      console.error('Error editing PDF:', error);
      toast({
        title: "Error",
        description: "Failed to edit PDF. Please try again.",
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
              Edit PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Add text, images, and annotations to your PDF documents
            </p>
          </div>

          <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Type className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary mb-1">PDF Editing</h3>
                <p className="text-sm text-muted-foreground">
                  Add text to your PDF documents. Text will be added to the first page at the top.
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
                  <h3 className="font-semibold mb-4">Edit Options</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="text-input">Text to Add</Label>
                      <Input
                        id="text-input"
                        type="text"
                        placeholder="Enter text to add to PDF..."
                        value={textToAdd}
                        onChange={(e) => setTextToAdd(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Text will be added to the top of the first page
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="font-semibold mb-2 text-sm">Features</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <p>Add custom text to PDFs</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <p>Preserves original PDF content</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <p>Creates new edited PDF file</p>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Button
                  onClick={handleEditPDF}
                  disabled={processing || !textToAdd.trim()}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg"
                >
                  {processing ? (
                    "Processing..."
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Edit PDF
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

export default EditPDF;
