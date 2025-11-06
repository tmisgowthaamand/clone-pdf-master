import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { Animated3DIcon } from "@/components/Animated3DIcon";
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-6">
              <Animated3DIcon 
                icon={Edit} 
                color="from-purple-500 to-pink-600"
                bgGradient="linear-gradient(135deg, #a855f7, #ec4899)"
              />
            </div>
            
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

          {/* Features Section */}
          <Card className="mt-8 p-4 sm:p-6 bg-gradient-to-br from-muted/50 to-muted/30 border-2 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
            <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative z-10">
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs sm:text-sm">✨</span>
                Editing Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {["✏️ Add and edit text", "🖼️ Insert images and logos", "✏️ Draw freehand", "▭ Add shapes", "🖍️ Highlight sections", "↶ Undo/Redo support"].map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background/50 hover:bg-background transition-colors duration-200 lg:hover:scale-105 lg:hover:shadow-md group/item"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 lg:group-hover/item:scale-110 transition-transform">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/80 group-hover/item:text-foreground transition-colors">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* How to Use Steps */}
          <Card className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-muted/40 to-muted/20 border-2 relative overflow-hidden">
            <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs sm:text-sm">📋</span>
                How to Use
              </h4>
              <ol className="space-y-2 sm:space-y-3">
                {[
                  "Click 'Open Editor' to launch the editing interface",
                  "Select tools from the left sidebar",
                  "Click on the PDF to add text, shapes, or annotations",
                  "Use the top toolbar for formatting options",
                  "Click 'Download PDF' when finished"
                ].map((step, index) => (
                  <li 
                    key={index} 
                    className="flex gap-2 sm:gap-3 items-start group lg:hover:translate-x-2 transition-transform duration-300"
                  >
                    <span className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg lg:group-hover:scale-110 transition-all duration-300">
                      {index + 1}
                    </span>
                    <div className="flex-1 pt-0.5 sm:pt-1">
                      <span className="text-xs sm:text-sm text-foreground font-medium group-hover:text-primary transition-colors">{step}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditPDF;
