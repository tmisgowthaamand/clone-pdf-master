import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Type, Upload, Building2, PenTool, Undo, Redo, Trash2, FileSignature } from "lucide-react";
import { Link } from "react-router-dom";
import { Animated3DIcon } from "@/components/Animated3DIcon";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as pdfjsLib from 'pdfjs-dist';

interface SignatureItem {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  data: string;
  type: 'signature' | 'stamp';
}

const SignPDF = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pdfData, setPdfData] = useState<string>("");
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [numPages, setNumPages] = useState(0);
  const [signatureType, setSignatureType] = useState<'type' | 'upload' | 'draw'>('type');
  const [signatureData, setSignatureData] = useState<string>("");
  const [stampData, setStampData] = useState<string>("");
  const [textSignature, setTextSignature] = useState("");
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [resizingItem, setResizingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [pdfDimensions, setPdfDimensions] = useState<{width: number, height: number}[]>([]);
  
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  }, []);

  const handleFilesSelected = async (newFiles: File[]) => {
    const selectedFile = newFiles[0];
    setFile(selectedFile);
    await loadPDF(selectedFile);
  };

  const loadPDF = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      setPdfData(base64);

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setNumPages(pdf.numPages);
      
      const pages: string[] = [];
      const dimensions: {width: number, height: number}[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 }); // Use scale 1.0 to get actual PDF dimensions
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: context, viewport }).promise;
        pages.push(canvas.toDataURL());
        dimensions.push({ width: viewport.width, height: viewport.height });
        
        console.log(`Page ${i} dimensions: ${viewport.width} x ${viewport.height}`);
      }
      
      setPdfPages(pages);
      setPdfDimensions(dimensions);
      toast({
        title: "PDF Loaded",
        description: `${pdf.numPages} pages loaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load PDF",
        variant: "destructive",
      });
    }
  };

  const createTextSignature = async () => {
    if (!textSignature.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/sign/create-text-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textSignature }),
      });

      const data = await response.json();
      if (data.success) {
        setSignatureData(`data:image/png;base64,${data.signature}`);
        toast({
          title: "Success",
          description: "Signature created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create signature",
        variant: "destructive",
      });
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureData(event.target?.result as string);
        toast({
          title: "Success",
          description: "Signature uploaded successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setStampData(event.target?.result as string);
        toast({
          title: "Success",
          description: "Company stamp uploaded successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Drawing Functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        // Save current state to history
        const dataUrl = canvas.toDataURL();
        const newHistory = canvasHistory.slice(0, historyStep + 1);
        newHistory.push(dataUrl);
        setCanvasHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
      }
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
    setCanvasHistory([]);
    setHistoryStep(-1);
  };

  const undoCanvas = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      
      // Clear and redraw from history
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (newStep >= 0) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = canvasHistory[newStep];
      }
    }
  };

  const redoCanvas = () => {
    if (historyStep < canvasHistory.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      
      // Clear and redraw from history
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = canvasHistory[newStep];
    }
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
    toast({
      title: "Success",
      description: "Signature saved successfully",
    });
  };

  const addQuickPlacement = (xPercent: number, yPercent: number, widthPercent: number, type: 'signature' | 'stamp') => {
    const data = type === 'stamp' ? stampData : signatureData;
    if (!data) {
      toast({
        title: "Error",
        description: `Please ${type === 'stamp' ? 'upload stamp' : 'create signature'} first`,
        variant: "destructive",
      });
      return;
    }

    if (pdfPages.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a PDF first",
        variant: "destructive",
      });
      return;
    }

    // Get the displayed image element to calculate scale
    const firstPageImg = document.querySelector('img[alt="Page 1"]') as HTMLImageElement;
    if (!firstPageImg) {
      toast({
        title: "Error",
        description: "PDF preview not ready",
        variant: "destructive",
      });
      return;
    }

    // Get actual PDF dimensions (from pdfjs)
    const pdfWidth = pdfDimensions[0]?.width || 612;
    const pdfHeight = pdfDimensions[0]?.height || 792;
    
    // Get displayed dimensions
    const displayedWidth = firstPageImg.clientWidth;
    const displayedHeight = firstPageImg.clientHeight;
    
    // Calculate positions based on percentages of DISPLAYED size
    const displayX = (xPercent / 100) * displayedWidth;
    const displayY = (yPercent / 100) * displayedHeight;
    const displayWidth = (widthPercent / 100) * displayedWidth;
    const displayHeight = displayWidth * 0.33; // Maintain aspect ratio

    console.log('Adding placement:', { 
      xPercent, yPercent, widthPercent, 
      pdfWidth, pdfHeight,
      displayedWidth, displayedHeight,
      displayX, displayY, displayWidth, displayHeight
    });

    const newSig: SignatureItem = {
      id: Date.now().toString(),
      page: 0,
      x: displayX,
      y: displayY,
      width: displayWidth,
      height: displayHeight,
      data: data,
      type: type,
    };

    setSignatures([...signatures, newSig]);
    toast({
      title: "Added",
      description: `${type === 'stamp' ? 'Stamp' : 'Signature'} added at ${xPercent}%, ${yPercent}%`,
    });
  };

  const downloadSignedPDF = async () => {
    if (!pdfData || signatures.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one signature",
        variant: "destructive",
      });
      return;
    }

    console.log('=== DOWNLOAD STARTED ===');
    console.log('Number of signatures:', signatures.length);
    console.log('Signatures data:', JSON.stringify(signatures, null, 2));
    console.log('PDF data length:', pdfData.length);

    // Get the displayed image to calculate scale factor
    const firstPageImg = document.querySelector('img[alt="Page 1"]') as HTMLImageElement;
    if (!firstPageImg) {
      toast({
        title: "Error",
        description: "Cannot find PDF preview",
        variant: "destructive",
      });
      return;
    }

    const displayedWidth = firstPageImg.clientWidth;
    const displayedHeight = firstPageImg.clientHeight;
    const pdfWidth = pdfDimensions[0]?.width || 612;
    const pdfHeight = pdfDimensions[0]?.height || 792;
    
    // Calculate scale factors
    const scaleX = pdfWidth / displayedWidth;
    const scaleY = pdfHeight / displayedHeight;
    
    console.log('Scale factors:', { displayedWidth, displayedHeight, pdfWidth, pdfHeight, scaleX, scaleY });

    // Prepare placements data - convert from displayed coordinates to PDF coordinates
    const placementsData = signatures.map(sig => {
      const pdfX = sig.x * scaleX;
      const pdfY = sig.y * scaleY;
      const pdfWidth = sig.width * scaleX;
      const pdfHeight = sig.height * scaleY;
      
      console.log(`Converting signature: display(${sig.x}, ${sig.y}, ${sig.width}x${sig.height}) -> pdf(${pdfX}, ${pdfY}, ${pdfWidth}x${pdfHeight})`);
      
      return {
        page: sig.page,
        x: Math.round(pdfX),
        y: Math.round(pdfY),
        width: Math.round(pdfWidth),
        height: Math.round(pdfHeight),
        data: sig.data,
        type: sig.type
      };
    });

    console.log('Sending placements:', placementsData);

    setIsProcessing(true);
    try {
      console.log('Calling API: /api/sign/apply-signatures');
      const response = await fetch('/api/sign/apply-signatures', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          pdf_data: pdfData,
          placements: placementsData,
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('Backend response:', data);
      
      if (data.success) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${data.signed_pdf}`;
        link.download = 'signed_document.pdf';
        link.click();
        
        toast({
          title: "Success",
          description: "PDF signed and downloaded successfully",
        });
      } else {
        console.error('Backend error:', data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to sign PDF",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: `Failed to sign PDF: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeSignature = (id: string) => {
    setSignatures(signatures.filter(sig => sig.id !== id));
  };

  // Drag and Drop Handlers
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const sig = signatures.find(s => s.id === id);
    if (!sig) return;
    
    setDraggedItem(id);
    setDragOffset({
      x: e.clientX - sig.x,
      y: e.clientY - sig.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedItem) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setSignatures(signatures.map(sig => 
        sig.id === draggedItem 
          ? { ...sig, x: Math.max(0, newX), y: Math.max(0, newY) }
          : sig
      ));
    }
    
    if (resizingItem) {
      const deltaX = e.clientX - resizeStart.x;
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = newWidth * 0.33; // Maintain aspect ratio
      
      setSignatures(signatures.map(sig =>
        sig.id === resizingItem
          ? { ...sig, width: newWidth, height: newHeight }
          : sig
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
    setResizingItem(null);
  };

  // Resize Handler
  const handleResizeStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const sig = signatures.find(s => s.id === id);
    if (!sig) return;
    
    setResizingItem(id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: sig.width,
      height: sig.height
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-6">
              <Animated3DIcon 
                icon={PenTool} 
                color="from-indigo-500 to-blue-600"
                bgGradient="linear-gradient(135deg, #6366f1, #2563eb)"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Sign PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Add your signature and company stamp to PDF documents
            </p>
          </div>

          <Card className="mb-6 p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <FileSignature className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary mb-1">PDF Signature Tool</h3>
                <p className="text-sm text-muted-foreground">
                  Create signatures by typing, uploading, or drawing. Add company stamps and position them anywhere on your PDF with drag-and-drop functionality.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Upload & Create */}
            <div className="lg:col-span-1 space-y-6">
              {/* Upload PDF */}
              <Card className="p-6 bg-muted/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>1️⃣</span>
                  <span>Upload PDF</span>
                </h2>
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  accept=".pdf"
                  multiple={false}
                  maxSize={50 * 1024 * 1024}
                />
                {file && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">{file.name}</p>
                    <p className="text-xs text-green-600">{numPages} pages</p>
                  </div>
                )}
              </Card>

              {/* Create Signature */}
              <Card className="p-6 bg-muted/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>2️⃣</span>
                  <span>Create Signature</span>
                </h2>
                <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as 'type' | 'upload' | 'draw')}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="type">
                      <Type className="w-4 h-4 mr-2" />
                      Type
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="draw">
                      <PenTool className="w-4 h-4 mr-2" />
                      Draw
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="type" className="space-y-4">
                    <div>
                      <Label htmlFor="text-signature">Your Name</Label>
                      <Input
                        id="text-signature"
                        placeholder="John Doe"
                        value={textSignature}
                        onChange={(e) => setTextSignature(e.target.value)}
                      />
                    </div>
                    <Button onClick={createTextSignature} className="w-full">
                      Create Signature
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="upload">
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => signatureInputRef.current?.click()}
                      className="w-full"
                      variant="outline"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Signature Image
                    </Button>
                  </TabsContent>

                  <TabsContent value="draw" className="space-y-4">
                    <div>
                      <Label>Draw Your Signature</Label>
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={150}
                        className="w-full border-2 border-gray-300 rounded-lg cursor-crosshair bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={undoCanvas} 
                        variant="outline" 
                        size="icon"
                        disabled={historyStep <= 0}
                        title="Undo"
                      >
                        <Undo className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={redoCanvas} 
                        variant="outline" 
                        size="icon"
                        disabled={historyStep >= canvasHistory.length - 1}
                        title="Redo"
                      >
                        <Redo className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={clearCanvas} 
                        variant="outline" 
                        size="icon"
                        title="Clear Canvas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button onClick={saveDrawnSignature} className="flex-1">
                        <PenTool className="w-4 h-4 mr-2" />
                        Save Signature
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                {signatureData && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Your Signature:</p>
                    <img src={signatureData} alt="Signature" className="max-w-full h-auto" />
                  </div>
                )}
              </Card>

              {/* Company Stamp */}
              <Card className="p-6 bg-muted/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  <span>Company Stamp</span>
                </h2>
                <input
                  ref={stampInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleStampUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => stampInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Company Stamp</span>
                </Button>

                {stampData && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Company Stamp:</p>
                    <img src={stampData} alt="Stamp" className="max-w-full h-auto max-h-32" />
                    
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Quick Add (iLovePDF Style):</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button size="sm" onClick={() => addQuickPlacement(75, 88, 15, 'stamp')} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <span className="text-base leading-none">📍</span>
                          <span className="text-sm">Bottom Right</span>
                        </Button>
                        <Button size="sm" onClick={() => addQuickPlacement(50, 88, 15, 'stamp')} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <span className="text-base leading-none">📍</span>
                          <span className="text-sm">Bottom Center</span>
                        </Button>
                        <Button size="sm" onClick={() => addQuickPlacement(50, 5, 15, 'stamp')} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <span className="text-base leading-none">📍</span>
                          <span className="text-sm">Top Center</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Quick Add Signature */}
              {signatureData && (
                <Card className="p-6 bg-muted/50">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span>3️⃣</span>
                    <span>Quick Add Signature</span>
                  </h2>
                  <p className="text-sm text-gray-600 mb-3">Like SmallPDF - Click to add signature</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" onClick={() => addQuickPlacement(75, 88, 20, 'signature')} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <span className="text-base leading-none">📍</span>
                      <span className="text-sm">Bottom Right</span>
                    </Button>
                    <Button size="sm" onClick={() => addQuickPlacement(10, 88, 20, 'signature')} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <span className="text-base leading-none">📍</span>
                      <span className="text-sm">Bottom Left</span>
                    </Button>
                    <Button size="sm" onClick={() => addQuickPlacement(75, 5, 20, 'signature')} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <span className="text-base leading-none">📍</span>
                      <span className="text-sm">Top Right</span>
                    </Button>
                    <Button size="sm" onClick={() => addQuickPlacement(10, 5, 20, 'signature')} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <span className="text-base leading-none">📍</span>
                      <span className="text-sm">Top Left</span>
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Panel - Preview & Download */}
            <div className="lg:col-span-2 space-y-6">
              {/* PDF Preview with Drag & Drop */}
              {pdfPages.length > 0 && (
                <Card className="p-6 bg-muted/50">
                  <h2 className="text-xl font-semibold mb-4">📄 PDF Preview - Drag & Drop Signatures</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    💡 Drag signatures/stamps to position them. Drag the blue circle to resize.
                  </p>
                  <div 
                    className="space-y-4 max-h-[600px] overflow-y-auto"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {pdfPages.map((page, index) => (
                      <div key={index} className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium">
                          Page {index + 1} of {numPages}
                        </div>
                        <div className="relative">
                          <img src={page} alt={`Page ${index + 1}`} className="w-full" />
                          
                          {/* Render draggable signatures/stamps on this page */}
                          {signatures
                            .filter(sig => sig.page === index)
                            .map(sig => (
                              <div
                                key={sig.id}
                                className="absolute cursor-move border-2 border-dashed hover:border-solid"
                                style={{
                                  left: `${sig.x}px`,
                                  top: `${sig.y}px`,
                                  width: `${sig.width}px`,
                                  height: `${sig.height}px`,
                                  borderColor: sig.type === 'stamp' ? '#FF6B35' : '#00C4B4',
                                  backgroundColor: 'rgba(255,255,255,0.9)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                }}
                                onMouseDown={(e) => handleMouseDown(e, sig.id)}
                              >
                                <img 
                                  src={sig.data} 
                                  alt={sig.type}
                                  className="w-full h-full object-contain pointer-events-none"
                                  draggable={false}
                                />
                                
                                {/* Resize Handle */}
                                <div
                                  className="absolute bottom-0 right-0 w-5 h-5 rounded-full cursor-nwse-resize"
                                  style={{
                                    backgroundColor: sig.type === 'stamp' ? '#FF6B35' : '#00C4B4',
                                    border: '2px solid white',
                                    transform: 'translate(50%, 50%)',
                                  }}
                                  onMouseDown={(e) => handleResizeStart(e, sig.id)}
                                />
                                
                                {/* Label */}
                                <div 
                                  className="absolute -top-6 left-0 text-xs font-medium px-2 py-1 rounded text-white"
                                  style={{
                                    backgroundColor: sig.type === 'stamp' ? '#FF6B35' : '#00C4B4',
                                  }}
                                >
                                  {sig.type === 'stamp' ? '🏢 Stamp' : '✍️ Signature'}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Added Items */}
              {signatures.length > 0 && (
                <Card className="p-6 bg-muted/50">
                  <h2 className="text-xl font-semibold mb-4">📋 Added Items ({signatures.length})</h2>
                  <div className="space-y-2">
                    {signatures.map((sig) => (
                      <div key={sig.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{sig.type === 'stamp' ? '🏢' : '✍️'}</span>
                          <div>
                            <p className="font-medium">
                              {sig.type === 'stamp' ? 'Company Stamp' : 'Signature'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Page {sig.page + 1} • Position: ({Math.round(sig.x)}, {Math.round(sig.y)})
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeSignature(sig.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Download Button */}
              {signatures.length > 0 && (
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      console.log('=== DEBUG INFO ===');
                      console.log('Signatures:', signatures);
                      console.log('PDF Data length:', pdfData.length);
                      console.log('Number of pages:', numPages);
                      alert(`Signatures: ${signatures.length}\nCheck console for details`);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    🔍 Debug Info (Check Console)
                  </Button>
                  <Button
                    onClick={downloadSignedPDF}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 h-12 text-lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {isProcessing ? 'Processing...' : 'Download Signed PDF'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <Card className="mt-8 p-4 sm:p-6 bg-gradient-to-br from-muted/50 to-muted/30 border-2 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative z-10">
                <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs sm:text-sm">✨</span>
                  Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {["✍️ Draw custom signatures", "🏢 Add company stamps", "📝 Type text signatures", "🖼️ Upload signature images", "📄 Multi-page support", "💾 Download signed PDF"].map((feature, index) => (
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

            {/* How to Sign Steps */}
            <div className="mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl sm:rounded-2xl border-2 relative overflow-hidden">
              <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg text-sm sm:text-base">
                    📋
                  </span>
                  How to Sign PDF
                </h2>
                <ol className="space-y-3 sm:space-y-4">
                  {[
                    "Upload your PDF file",
                    "Draw, type, or upload your signature",
                    "Click on the PDF to place your signature",
                    "Download your signed PDF document"
                  ].map((step, index) => (
                    <li 
                      key={index} 
                      className="flex gap-3 sm:gap-4 items-start group lg:hover:translate-x-2 transition-transform duration-300"
                    >
                      <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-base sm:text-lg font-bold shadow-lg lg:group-hover:scale-110 lg:group-hover:rotate-6 transition-all duration-300">
                        {index + 1}
                      </span>
                      <div className="flex-1 pt-1 sm:pt-2">
                        <span className="text-sm sm:text-base text-foreground font-medium group-hover:text-primary transition-colors">{step}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignPDF;
