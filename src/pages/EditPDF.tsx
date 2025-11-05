import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { PDFEditor } from "@/components/PDFEditor";

const EditPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [pdfData, setPdfData] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const { toast } = useToast();

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

    const file = files[0];
    
    // Load PDF into editor
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        setPdfData(base64Data.split(',')[1]);
        setFilename(file.name);
        setShowEditor(true);
        
        toast({
          title: "Opening Editor",
          description: "Loading PDF editor interface...",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackFromEditor = () => {
    setShowEditor(false);
    setPdfData("");
    setFilename("");
  };

  if (showEditor) {
    return <PDFEditor pdfData={pdfData} filename={filename} onBack={handleBackFromEditor} />;
  }

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
              Add text, images, shapes, and annotations to your PDF documents
            </p>
          </div>

          <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Edit className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary mb-1">Interactive PDF Editor</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your PDF and use our full-featured editor with tools for text, drawing, shapes, and more.
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
                  <h3 className="font-semibold mb-4">Editing Features</h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-6">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <p>✏️ Add and edit text with custom fonts and sizes</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <p>🖼️ Insert images and logos</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <p>✏️ Draw freehand with pen tool</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <p>▭ Add shapes (rectangles, circles, lines)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <p>🖍️ Highlight text and sections</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <p>↶ Undo/Redo support</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <p>🔍 Zoom in/out for precision editing</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                      <p>📄 Multi-page support with thumbnails</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold mb-2 text-sm">How to Use</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                      <li>Click "Open Editor" to launch the editing interface</li>
                      <li>Select tools from the left sidebar</li>
                      <li>Click on the PDF to add text, shapes, or annotations</li>
                      <li>Use the top toolbar for formatting options</li>
                      <li>Click "Download PDF" when finished</li>
                    </ol>
                  </div>
                </Card>
                
                <Button
                  onClick={handleEditPDF}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Open Editor
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
