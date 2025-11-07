import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Droplets, Type, Image as ImageIcon, Download, Eye, Stamp } from "lucide-react";
import { Link } from "react-router-dom";
import { Animated3DIcon } from "@/components/Animated3DIcon";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API_ENDPOINTS } from '@/config/api';
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const WatermarkPDF = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [opacity, setOpacity] = useState([50]);
  const [rotation, setRotation] = useState([0]);
  const [fontSize, setFontSize] = useState([40]);
  const [position, setPosition] = useState('center');
  const [color, setColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [layer, setLayer] = useState<'over' | 'below'>('over');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      const file = newFiles[0];
      // Optimize: Use blob URL with type hint for faster loading
      const url = URL.createObjectURL(file);
      setPdfPreview(url + '#toolbar=0&navpanes=0&scrollbar=0'); // Disable PDF toolbar for faster rendering
    }
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (pdfPreview) {
      URL.revokeObjectURL(pdfPreview);
      setPdfPreview(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setWatermarkImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      if (pdfPreview) URL.revokeObjectURL(pdfPreview);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [pdfPreview, imagePreview]);

  const getPositionStyle = () => {
    // Match backend positioning with dynamic margins (text width/2 + 20px)
    const margin = 30; // Approximate margin for preview
    const positions: Record<string, string> = {
      'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'top-left': `top-[${margin}px] left-[${margin}px]`,
      'top-center': `top-[${margin}px] left-1/2 -translate-x-1/2`,
      'top-right': `top-[${margin}px] right-[${margin}px]`,
      'middle-left': `top-1/2 left-[${margin}px] -translate-y-1/2`,
      'middle-right': `top-1/2 right-[${margin}px] -translate-y-1/2`,
      'bottom-left': `bottom-[${margin}px] left-[${margin}px]`,
      'bottom-center': `bottom-[${margin}px] left-1/2 -translate-x-1/2`,
      'bottom-right': `bottom-[${margin}px] right-[${margin}px]`,
    };
    return positions[position] || positions['center'];
  };

  const handleWatermark = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('watermarkType', watermarkType);
      
      if (watermarkType === 'text') {
        formData.append('text', watermarkText);
        formData.append('fontSize', fontSize[0].toString());
        formData.append('color', color);
        formData.append('fontFamily', fontFamily);
        formData.append('isBold', isBold.toString());
        formData.append('isItalic', isItalic.toString());
        formData.append('isUnderline', isUnderline.toString());
      } else if (watermarkImage) {
        formData.append('watermarkImage', watermarkImage);
      }
      
      formData.append('opacity', (opacity[0] / 100).toString());
      formData.append('rotation', rotation[0].toString());
      formData.append('position', position);
      formData.append('layer', layer);

      toast({
        title: "🚀 Processing...",
        description: "Adding watermark to your PDF...",
      });

      // Call Python Flask backend (port 5000)
      const response = await fetch(API_ENDPOINTS.WATERMARK_ADD, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Watermark failed';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Download the watermarked PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '_watermarked.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "✅ Success!",
        description: "Watermark added and downloaded successfully",
      });
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Watermark error:', error);
      setIsProcessing(false);
      
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : 'Failed to add watermark. Make sure Python backend is running on port 5000',
        variant: "destructive",
      });
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
            <div className="flex justify-center mb-6">
              <Animated3DIcon 
                icon={Stamp} 
                color="from-amber-500 to-orange-600"
                bgGradient="linear-gradient(135deg, #f59e0b, #ea580c)"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Watermark PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Add a watermark or text stamp to your PDF documents
            </p>
          </div>

          <Card className="mb-6 p-4 bg-purple-50 dark:bg-purple-950 border-purple-200">
            <div className="flex items-start gap-3">
              <Droplets className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Watermark PDF</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Add a watermark or text stamp to your PDF documents.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <FileUpload onFilesSelected={handleFilesSelected} multiple={false} accept=".pdf" />
            
            {files.length > 0 && (
              <>
                <FileList files={files} onRemove={handleRemove} />
                
                {/* PDF Preview with Watermark */}
                {pdfPreview && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Preview</h3>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Watermark will appear exactly as shown below
                      </span>
                    </div>
                    <div className="relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700" style={{ height: '600px' }}>
                      {/* PDF Preview - Optimized for faster loading */}
                      <iframe
                        src={pdfPreview}
                        className="w-full h-full"
                        title="PDF Preview"
                        loading="lazy"
                        style={{ contain: 'strict' }}
                      />
                      
                      {/* Position Grid Overlay - Shows all 9 positions */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Grid lines */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="border border-dashed border-blue-400"></div>
                          ))}
                        </div>
                        
                        {/* Position indicators */}
                        {position !== 'tile' && position !== 'mosaic' && (
                          <>
                            {/* Top row */}
                            <div className={`absolute top-4 left-4 w-3 h-3 rounded-full ${position === 'top-left' ? 'bg-blue-500 ring-4 ring-blue-300' : 'bg-gray-400'}`}></div>
                            <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${position === 'top-center' ? 'bg-blue-500 ring-4 ring-blue-300' : 'bg-gray-400'}`}></div>
                            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${position === 'top-right' ? 'bg-blue-500 ring-4 ring-blue-300' : 'bg-gray-400'}`}></div>
                            
                            {/* Middle row */}
                            <div className={`absolute top-1/2 -translate-y-1/2 left-4 w-3 h-3 rounded-full ${position === 'middle-left' ? 'bg-blue-500 ring-4 ring-blue-300' : 'bg-gray-400'}`}></div>
                            <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${position === 'center' ? 'bg-blue-500 ring-4 ring-blue-300' : 'bg-gray-400'}`}></div>
                            <div className={`absolute top-1/2 -translate-y-1/2 right-4 w-3 h-3 rounded-full ${position === 'middle-right' ? 'bg-blue-500 ring-4 ring-blue-300' : 'bg-gray-400'}`}></div>
                            
                            {/* Bottom row */}
                            <div className={`absolute bottom-4 left-4 w-3 h-3 rounded-full ${position === 'bottom-left' ? 'bg-blue-500 ring-4 ring-blue-300' : 'bg-gray-400'}`}></div>
                            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${position === 'bottom-center' ? 'bg-blue-500 ring-4 ring-blue-300' : 'bg-gray-400'}`}></div>
                            <div className={`absolute bottom-4 right-4 w-3 h-3 rounded-full ${position === 'bottom-right' ? 'bg-blue-500 ring-4 ring-blue-300' : 'bg-gray-400'}`}></div>
                          </>
                        )}
                      </div>
                      
                      {/* Watermark Overlay Preview */}
                      {position !== 'tile' && position !== 'mosaic' && (
                        <div 
                          className={`absolute pointer-events-none ${getPositionStyle()}`}
                          style={{
                            opacity: opacity[0] / 100,
                            transform: `${getPositionStyle().includes('translate') ? '' : 'translate(0, 0)'} rotate(${rotation[0]}deg)`,
                          }}
                        >
                          {watermarkType === 'text' ? (
                            <div
                              style={{
                                fontSize: `${fontSize[0]}px`,
                                color: color,
                                fontFamily: fontFamily,
                                fontWeight: isBold ? 'bold' : 'normal',
                                fontStyle: isItalic ? 'italic' : 'normal',
                                textDecoration: isUnderline ? 'underline' : 'none',
                                whiteSpace: 'nowrap',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                              }}
                            >
                              {watermarkText}
                            </div>
                          ) : imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Watermark preview"
                              className="max-w-[200px] max-h-[200px] object-contain"
                            />
                          ) : null}
                        </div>
                      )}
                      
                      {/* Tile Pattern Preview */}
                      {position === 'tile' && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div
                              key={i}
                              className="absolute"
                              style={{
                                top: `${(i % 4) * 25}%`,
                                left: `${Math.floor(i / 4) * 20}%`,
                                opacity: opacity[0] / 100,
                                transform: `rotate(${rotation[0]}deg)`,
                              }}
                            >
                              {watermarkType === 'text' ? (
                                <div
                                  style={{
                                    fontSize: `${fontSize[0] * 0.6}px`,
                                    color: color,
                                    fontFamily: fontFamily,
                                    fontWeight: isBold ? 'bold' : 'normal',
                                    fontStyle: isItalic ? 'italic' : 'normal',
                                    textDecoration: isUnderline ? 'underline' : 'none',
                                    whiteSpace: 'nowrap',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                                  }}
                                >
                                  {watermarkText}
                                </div>
                              ) : imagePreview ? (
                                <img
                                  src={imagePreview}
                                  alt="Watermark"
                                  className="max-w-[100px] max-h-[100px] object-contain"
                                />
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Mosaic Grid Pattern Preview */}
                      {position === 'mosaic' && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden grid grid-cols-3 grid-rows-3 gap-4 p-4">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-center"
                              style={{
                                opacity: opacity[0] / 100,
                                transform: `rotate(${rotation[0]}deg)`,
                              }}
                            >
                              {watermarkType === 'text' ? (
                                <div
                                  style={{
                                    fontSize: `${fontSize[0] * 0.5}px`,
                                    color: color,
                                    fontFamily: fontFamily,
                                    fontWeight: isBold ? 'bold' : 'normal',
                                    fontStyle: isItalic ? 'italic' : 'normal',
                                    textDecoration: isUnderline ? 'underline' : 'none',
                                    whiteSpace: 'nowrap',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                                  }}
                                >
                                  {watermarkText}
                                </div>
                              ) : imagePreview ? (
                                <img
                                  src={imagePreview}
                                  alt="Watermark"
                                  className="max-w-[80px] max-h-[80px] object-contain"
                                />
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <p className="text-muted-foreground">
                        Preview shows approximate watermark placement
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Position:</span>
                        <span className="font-semibold text-primary capitalize">
                          {position.replace('-', ' ')}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      </div>
                    </div>
                  </Card>
                )}
                
                {/* Watermark Configuration */}
                <Card className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold">Watermark Settings</h3>
                  
                  {/* Watermark Type Tabs */}
                  <Tabs value={watermarkType} onValueChange={(v) => setWatermarkType(v as 'text' | 'image')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Text
                      </TabsTrigger>
                      <TabsTrigger value="image" className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Image
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="text" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="watermark-text">Watermark Text</Label>
                        <Input
                          id="watermark-text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="Enter watermark text"
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="font-family">Font Family</Label>
                        <Select value={fontFamily} onValueChange={setFontFamily}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Courier New">Courier New</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                            <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                            <SelectItem value="Impact">Impact</SelectItem>
                            <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="font-size">Font Size: {fontSize[0]}px</Label>
                        <Slider
                          id="font-size"
                          value={fontSize}
                          onValueChange={setFontSize}
                          min={10}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Text Formatting</Label>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant={isBold ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsBold(!isBold)}
                            className="font-bold"
                          >
                            B
                          </Button>
                          <Button
                            type="button"
                            variant={isItalic ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsItalic(!isItalic)}
                            className="italic"
                          >
                            I
                          </Button>
                          <Button
                            type="button"
                            variant={isUnderline ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsUnderline(!isUnderline)}
                            className="underline"
                          >
                            U
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="color">Text Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="color"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            placeholder="#000000"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="image" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="watermark-image">Upload Watermark Image</Label>
                        <Input
                          id="watermark-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="mt-2"
                        />
                        {watermarkImage && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Selected: {watermarkImage.name}
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  {/* Common Settings */}
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Select value={position} onValueChange={setPosition}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" side="bottom" align="start" sideOffset={4}>
                          <SelectItem value="diagonal">Full Page Diagonal</SelectItem>
                          <SelectItem value="mosaic">Mosaic (Grid Pattern)</SelectItem>
                          <SelectItem value="tile">Tile (Repeat)</SelectItem>
                          <SelectItem value="center">Middle Center</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                          <SelectItem value="top-center">Top Center</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="middle-left">Middle Left</SelectItem>
                          <SelectItem value="middle-right">Middle Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="bottom-center">Bottom Center</SelectItem>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="layer">Layer</Label>
                      <Select value={layer} onValueChange={(value: 'over' | 'below') => setLayer(value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" side="bottom" align="start" sideOffset={4}>
                          <SelectItem value="over">Over the PDF content</SelectItem>
                          <SelectItem value="below">Below the PDF content</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="opacity">Opacity: {opacity[0]}%</Label>
                      <Slider
                        id="opacity"
                        value={opacity}
                        onValueChange={setOpacity}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="rotation">Rotation: {rotation[0]}°</Label>
                      <Slider
                        id="rotation"
                        value={rotation}
                        onValueChange={setRotation}
                        min={-180}
                        max={180}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </Card>
                
                <Button
                  onClick={handleWatermark}
                  disabled={isProcessing || (watermarkType === 'image' && !watermarkImage)}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 h-12 text-lg"
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Add Watermark & Download
                    </>
                  )}
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
                Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {["💧 Text or image watermarks", "🎨 Customize opacity & rotation", "📝 Multiple font options", "📍 Position control", "⚡ Fast processing", "💾 Download watermarked PDF"].map((feature, index) => (
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

          {/* How to Add Watermark Steps */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl sm:rounded-2xl border-2 relative overflow-hidden">
            <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg text-sm sm:text-base">
                  📋
                </span>
                How to Add Watermark
              </h2>
              <ol className="space-y-3 sm:space-y-4">
                {[
                  "Upload your PDF file",
                  "Choose text or image watermark",
                  "Customize opacity, rotation, and position",
                  "Click 'Add Watermark & Download'"
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

export default WatermarkPDF;
