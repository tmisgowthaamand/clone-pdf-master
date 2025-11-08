import { useState } from "react";
import { API_ENDPOINTS } from '@/config/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Unlock, Lock, Download, Loader2, AlertCircle, CheckCircle2, Eye, ZoomIn, ZoomOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Animated3DIcon } from "@/components/Animated3DIcon";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { downloadBlob } from "@/utils/downloadHelper";

const UnlockPDF = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  const [processedPdfBlob, setProcessedPdfBlob] = useState<Blob | null>(null);
  const [processedFileName, setProcessedFileName] = useState<string>("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(1.0);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setPassword("");
    setProcessedPdfUrl(null);
    setNeedsPassword(false);
    setErrorMessage("");
    setShowPreview(false);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPassword("");
    setProcessedPdfUrl(null);
    setNeedsPassword(false);
    setErrorMessage("");
    setShowPreview(false);
  };

  const handleUnlock = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to unlock",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setProcessedPdfUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      
      if (password) {
        formData.append("password", password);
      }

      const response = await fetch(API_ENDPOINTS.PDF_UNLOCK, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if password is needed (from backend flag or error message)
        if (errorData.needsPassword || (errorData.error && errorData.error.includes("password-protected"))) {
          setNeedsPassword(true);
          setErrorMessage(errorData.error);
          toast({
            title: "Password Required",
            description: "This PDF is password-protected. Please enter the password.",
          });
          setIsProcessing(false);
          return;
        }
        
        // Check if password is incorrect
        if (errorData.error && errorData.error.includes("Incorrect password")) {
          setNeedsPassword(true);
          setErrorMessage(errorData.error);
          toast({
            title: "Incorrect Password",
            description: "The password you entered is incorrect. Please try again.",
          });
          setIsProcessing(false);
          return;
        }
        
        throw new Error(errorData.error || "Failed to unlock PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const originalName = files[0].name.replace('.pdf', '');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `${originalName}_unlocked_${timestamp}.pdf`;
      
      setProcessedPdfUrl(url);
      setProcessedPdfBlob(blob);
      setProcessedFileName(fileName);
      setShowPreview(true);
      
      toast({
        title: "Success!",
        description: "PDF unlocked successfully. Preview is now available.",
      });
    } catch (error) {
      console.error("Unlock error:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to unlock PDF";
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedPdfBlob) {
      downloadBlob(processedPdfBlob, processedFileName);
      
      toast({
        title: "Downloaded",
        description: "Your unlocked PDF has been downloaded.",
      });
    }
  };

  const handleReset = () => {
    setProcessedPdfUrl(null);
    setProcessedPdfBlob(null);
    setProcessedFileName("");
    setPassword("");
    setNeedsPassword(false);
    setErrorMessage("");
    setShowPreview(false);
    setPreviewScale(1.0);
    if (processedPdfUrl) {
      URL.revokeObjectURL(processedPdfUrl);
    }
  };

  const handleZoomIn = () => {
    setPreviewScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setPreviewScale(prev => Math.max(prev - 0.25, 0.5));
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
                icon={Unlock} 
                color="from-cyan-500 to-teal-600"
                bgGradient="linear-gradient(135deg, #06b6d4, #0d9488)"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Unlock PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Remove PDF password security, giving you the freedom to use your PDFs as you want
            </p>
          </div>

          <Card className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800">
            <div className="flex items-start gap-3">
              <Unlock className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-1">How it works</h3>
                <p className="text-sm text-cyan-700 dark:text-cyan-300">
                  Upload your password-protected PDF, enter the password if required, and get an unlocked version without any restrictions.
                </p>
              </div>
            </div>
          </Card>

          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {processedPdfUrl && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                PDF unlocked successfully! Your file is ready to download.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {!processedPdfUrl ? (
              <>
                <FileUpload onFilesSelected={handleFilesSelected} multiple={false} accept=".pdf" />
                
                {files.length > 0 && (
                  <>
                    <FileList files={files} onRemove={handleRemove} />
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        PDF Password (if protected) {needsPassword && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter PDF password (optional)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full"
                        disabled={isProcessing}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isProcessing) {
                            handleUnlock();
                          }
                        }}
                      />
                      <p className="text-sm text-muted-foreground">
                        {needsPassword 
                          ? "⚠️ This PDF is password-protected. Please enter the password to unlock it."
                          : "Leave empty if your PDF is not password-protected."}
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleUnlock}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Unlocking PDF...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-5 h-5 mr-2" />
                          Unlock PDF
                        </>
                      )}
                    </Button>
                  </>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {/* Action Buttons */}
                <Card className="p-4 bg-gradient-to-br from-green-50 to-cyan-50 dark:from-green-950 dark:to-cyan-950 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">PDF Unlocked Successfully!</h3>
                        <p className="text-xs text-muted-foreground">{processedFileName}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownload}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                    >
                      Unlock Another
                    </Button>
                  </div>
                </Card>

                {/* PDF Preview Section */}
                {showPreview && processedPdfUrl && (
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        PDF Preview
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleZoomOut}
                          variant="outline"
                          size="sm"
                          disabled={previewScale <= 0.5}
                        >
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[60px] text-center">
                          {Math.round(previewScale * 100)}%
                        </span>
                        <Button
                          onClick={handleZoomIn}
                          variant="outline"
                          size="sm"
                          disabled={previewScale >= 3.0}
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-auto max-h-[800px] bg-gray-100 dark:bg-gray-900">
                      <div 
                        className="flex justify-center p-4"
                        style={{ 
                          transform: `scale(${previewScale})`,
                          transformOrigin: 'top center',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        <iframe
                          src={processedPdfUrl}
                          className="w-full border-0 rounded shadow-lg"
                          style={{ 
                            height: '100vh',
                            minHeight: '600px',
                            backgroundColor: 'white'
                          }}
                          title="PDF Preview"
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Security Note */}
                <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Security Note</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your unlocked PDF has been processed locally. The password protection has been removed, 
                        and you can now freely edit, print, or copy content from this PDF.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
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
                {["🔓 Remove PDF password", "📝 Enable editing & copying", "🖨️ Allow printing", "⚡ Fast processing", "🔒 Secure local unlock", "💾 Download unlocked PDF"].map((feature, index) => (
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

          {/* How to Unlock Steps */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl sm:rounded-2xl border-2 relative overflow-hidden">
            <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg text-sm sm:text-base">
                  📋
                </span>
                How to Unlock PDF
              </h2>
              <ol className="space-y-3 sm:space-y-4">
                {[
                  "Upload your password-protected PDF",
                  "Enter the PDF password",
                  "Click 'Unlock PDF' to remove protection",
                  "Download your unlocked PDF file"
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

export default UnlockPDF;
