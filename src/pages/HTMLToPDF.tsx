import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Code, Download, FileText, Eye, RefreshCw } from "lucide-react";
import { API_ENDPOINTS } from '@/config/api';
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadBlob } from "@/utils/downloadHelper";

const HTMLToPDF = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [marginTop, setMarginTop] = useState([5]);
  const [marginBottom, setMarginBottom] = useState([5]);
  const [marginLeft, setMarginLeft] = useState([5]);
  const [marginRight, setMarginRight] = useState([5]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    // Show preview when URL or HTML content is available
    if (url || htmlContent) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [url, htmlContent]);

  useEffect(() => {
    // Suppress iframe-related console errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      // Filter out common iframe errors
      if (
        message.includes('net::ERR_ABORTED') ||
        message.includes('Failed to load resource') ||
        message.includes('Content Security Policy') ||
        message.includes('frame-ancestors') ||
        message.includes('Unsafe attempt to initiate navigation')
      ) {
        return; // Suppress these errors
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      if (message.includes('sandbox')) {
        return; // Suppress sandbox warnings
      }
      originalWarn.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  const handleConvert = async () => {
    if (!url && !htmlContent) {
      toast({
        title: "⚠️ Input Required",
        description: "Please enter a URL or paste HTML content",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      if (url) {
        formData.append('url', url);
      } else {
        formData.append('html', htmlContent);
      }
      formData.append('pageSize', pageSize);
      formData.append('orientation', orientation);
      formData.append('marginTop', marginTop[0].toString());
      formData.append('marginBottom', marginBottom[0].toString());
      formData.append('marginLeft', marginLeft[0].toString());
      formData.append('marginRight', marginRight[0].toString());

      toast({
        title: "🔄 Processing...",
        description: "Converting HTML to PDF...",
      });

      const response = await fetch(API_ENDPOINTS.HTML_TO_PDF, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const blob = await response.blob();
      const filename = url ? `${new URL(url).hostname}.pdf` : 'converted.pdf';
      downloadBlob(blob, filename);

      toast({
        title: "✅ Success",
        description: "PDF downloaded successfully",
      });

      setIsProcessing(false);
    } catch (error) {
      console.error('Conversion error:', error);
      setIsProcessing(false);

      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : 'Failed to convert HTML to PDF',
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
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              HTML to PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Convert webpages in HTML to PDF. Copy and paste the URL to convert
            </p>
          </div>

          <Card className="mb-6 p-4 bg-orange-50 dark:bg-orange-950 border-orange-200">
            <div className="flex items-start gap-3">
              <Code className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">HTML to PDF</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Convert webpages in HTML to PDF. Copy and paste the URL to convert.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">From URL</TabsTrigger>
                  <TabsTrigger value="html">From HTML Code</TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="mt-4">
                  <div>
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setHtmlContent("");
                      }}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Enter the complete URL of the webpage you want to convert
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="html" className="mt-4">
                  <div>
                    <Label htmlFor="html">HTML Code</Label>
                    <Textarea
                      id="html"
                      placeholder="<html>&#10;  <head>&#10;    <title>My Page</title>&#10;  </head>&#10;  <body>&#10;    <h1>Hello World</h1>&#10;  </body>&#10;</html>"
                      value={htmlContent}
                      onChange={(e) => {
                        setHtmlContent(e.target.value);
                        setUrl("");
                      }}
                      className="mt-2 min-h-[250px] font-mono text-sm"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Paste your complete HTML code including &lt;html&gt; tags
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
            
            {/* Preview Section */}
            {showPreview && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Preview</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshPreview}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <div className="relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700" style={{ height: '600px' }}>
                  {url ? (
                    <div className="w-full h-full">
                      <iframe
                        key={previewKey}
                        src={url}
                        className="w-full h-full"
                        title="Website Preview"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        onError={() => {
                          toast({
                            title: "⚠️ Preview Unavailable",
                            description: "This website blocks iframe embedding. The PDF will still be generated.",
                            variant: "default",
                          });
                        }}
                      />
                    </div>
                  ) : htmlContent ? (
                    <iframe
                      key={previewKey}
                      srcDoc={htmlContent}
                      className="w-full h-full"
                      title="HTML Preview"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                  ) : null}
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Preview of the content that will be converted to PDF
                  </p>
                  {url && (
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="text-xs text-amber-800 dark:text-amber-200 font-medium mb-1">
                        ⚠️ Preview Limitations
                      </p>
                      <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                        <li>Some websites block iframe embedding (CSP/X-Frame-Options)</li>
                        <li>External resources (ads, analytics, trackers) may not load in preview</li>
                        <li>Console errors are normal and don't affect PDF conversion</li>
                        <li>The backend fetches the full page directly for accurate PDF generation</li>
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Page Settings
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pageSize">Page Size</Label>
                  <Select value={pageSize} onValueChange={setPageSize}>
                    <SelectTrigger id="pageSize" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                      <SelectItem value="A3">A3 (297 × 420 mm)</SelectItem>
                      <SelectItem value="A5">A5 (148 × 210 mm)</SelectItem>
                      <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                      <SelectItem value="Legal">Legal (8.5 × 14 in)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="orientation">Orientation</Label>
                  <Select value={orientation} onValueChange={(v: 'portrait' | 'landscape') => setOrientation(v)}>
                    <SelectTrigger id="orientation" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Margins (mm)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Top: {marginTop[0]}mm</Label>
                    <Slider
                      value={marginTop}
                      onValueChange={setMarginTop}
                      min={0}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Bottom: {marginBottom[0]}mm</Label>
                    <Slider
                      value={marginBottom}
                      onValueChange={setMarginBottom}
                      min={0}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Left: {marginLeft[0]}mm</Label>
                    <Slider
                      value={marginLeft}
                      onValueChange={setMarginLeft}
                      min={0}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Right: {marginRight[0]}mm</Label>
                    <Slider
                      value={marginRight}
                      onValueChange={setMarginRight}
                      min={0}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            <Button
              onClick={handleConvert}
              disabled={(!url && !htmlContent) || isProcessing}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-12 text-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              {isProcessing ? 'Converting...' : 'Convert to PDF'}
            </Button>

            {/* Features Section */}
            <Card className="mt-8 p-4 sm:p-6 bg-gradient-to-br from-muted/50 to-muted/30 border-2 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative z-10">
                <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs sm:text-sm">✨</span>
                  Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {["🌐 Convert URL or HTML code", "📄 Custom page size & orientation", "📏 Adjustable margins", "⚡ Fast conversion", "🔒 Secure processing", "💾 Download as PDF"].map((feature, index) => (
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

            {/* How to Convert Steps */}
            <div className="mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl sm:rounded-2xl border-2 relative overflow-hidden">
              <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg text-sm sm:text-base">
                    📋
                  </span>
                  How to Convert HTML to PDF
                </h2>
                <ol className="space-y-3 sm:space-y-4">
                  {[
                    "Enter a website URL or paste HTML code",
                    "Customize page size, orientation, and margins",
                    "Preview your content (optional)",
                    "Click 'Convert to PDF' to download"
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
    </div>
  );
};

export default HTMLToPDF;
