import { useState } from "react";
import { API_ENDPOINTS } from '@/config/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/FileUpload";
import { FileList } from "@/components/FileList";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, Eye, EyeOff, Download, Loader2, CheckCircle2, AlertCircle, ZoomIn, ZoomOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Animated3DIcon } from "@/components/Animated3DIcon";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { downloadBlob } from "@/utils/downloadHelper";

const ProtectPDF = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [protectedPdfUrl, setProtectedPdfUrl] = useState<string | null>(null);
  const [protectedPdfBlob, setProtectedPdfBlob] = useState<Blob | null>(null);
  const [protectedFileName, setProtectedFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(1.0);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setPassword("");
    setConfirmPassword("");
    setProtectedPdfUrl(null);
    setErrorMessage("");
    setShowPreview(false);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPassword("");
    setConfirmPassword("");
    setProtectedPdfUrl(null);
    setErrorMessage("");
    setShowPreview(false);
  };

  const handleProtect = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to protect",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      setErrorMessage("Please enter a password");
      toast({
        title: "Password Required",
        description: "Please enter a password to protect your PDF",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered do not match",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setProtectedPdfUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("password", password);

      const response = await fetch(API_ENDPOINTS.PDF_PROTECT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to protect PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const originalName = files[0].name.replace('.pdf', '');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `${originalName}_protected_${timestamp}.pdf`;
      
      setProtectedPdfUrl(url);
      setProtectedPdfBlob(blob);
      setProtectedFileName(fileName);
      setShowPreview(true);
      
      toast({
        title: "Success!",
        description: "PDF protected successfully. Preview is now available.",
      });
    } catch (error) {
      console.error("Protection error:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to protect PDF";
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
    if (protectedPdfBlob) {
      downloadBlob(protectedPdfBlob, protectedFileName);
      
      toast({
        title: "Downloaded",
        description: "Your protected PDF has been downloaded.",
      });
    }
  };

  const handleReset = () => {
    setProtectedPdfUrl(null);
    setProtectedPdfBlob(null);
    setProtectedFileName("");
    setPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setShowPreview(false);
    setPreviewScale(1.0);
    if (protectedPdfUrl) {
      URL.revokeObjectURL(protectedPdfUrl);
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
                icon={Lock} 
                color="from-purple-500 to-violet-600"
                bgGradient="linear-gradient(135deg, #a855f7, #7c3aed)"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Protect PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Set a password to protect your PDF file
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {protectedPdfUrl && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                PDF protected successfully! Your file is ready to download.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {!protectedPdfUrl ? (
              <>
                <FileUpload onFilesSelected={handleFilesSelected} multiple={false} accept=".pdf" />
                
                {files.length > 0 && (
                  <>
                    <FileList files={files} onRemove={handleRemove} />
                    
                    {/* Password Input Section - Matching ilovepdf style */}
                    <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border-red-200 dark:border-red-800">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                        Set a password to protect your PDF file
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Type Password */}
                        <div className="space-y-2">
                          <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                            <Lock className="w-4 h-4" />
                            Type password
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Type password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pr-10 h-12 bg-white dark:bg-gray-800"
                              disabled={isProcessing}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Repeat Password */}
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium">
                            <Lock className="w-4 h-4" />
                            Repeat password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Repeat password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pr-10 h-12 bg-white dark:bg-gray-800"
                              disabled={isProcessing}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isProcessing) {
                                  handleProtect();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    <Button
                      onClick={handleProtect}
                      disabled={isProcessing || !password || !confirmPassword}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 h-14 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Protecting PDF...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          Protect PDF
                        </>
                      )}
                    </Button>
                  </>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {/* Action Buttons */}
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">PDF Protected Successfully!</h3>
                        <p className="text-xs text-muted-foreground">{protectedFileName}</p>
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
                      Protect Another
                    </Button>
                  </div>
                </Card>

                {/* PDF Preview Section */}
                {showPreview && protectedPdfUrl && (
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Protected PDF Preview
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
                          src={protectedPdfUrl}
                          className="w-full border-0 rounded shadow-lg"
                          style={{ 
                            height: '100vh',
                            minHeight: '600px',
                            backgroundColor: 'white'
                          }}
                          title="Protected PDF Preview"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          <strong>Note:</strong> This preview shows the protected PDF. When opened separately, 
                          users will be prompted to enter the password you set.
                        </p>
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
                        Your PDF is now password-protected with AES-256 encryption. Users will need to enter 
                        the password you set to open this file. Keep your password safe and secure.
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
                {["🔒 AES-256 encryption", "🔐 Password protection", "🛡️ Secure your PDFs", "⚡ Fast processing", "🔒 Local encryption", "💾 Download protected PDF"].map((feature, index) => (
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

          {/* How to Protect Steps */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl sm:rounded-2xl border-2 relative overflow-hidden">
            <div className="hidden lg:block absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg text-sm sm:text-base">
                  📋
                </span>
                How to Protect PDF
              </h2>
              <ol className="space-y-3 sm:space-y-4">
                {[
                  "Upload your PDF file",
                  "Enter a strong password",
                  "Confirm your password",
                  "Click 'Protect PDF' and download"
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

export default ProtectPDF;
