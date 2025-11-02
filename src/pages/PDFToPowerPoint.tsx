import { useState } from "react";
import { ConversionTemplate } from "@/components/ConversionTemplate";
import { useToast } from "@/hooks/use-toast";

const PDFToPowerPoint = () => {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePythonConversion = async (file: File) => {
    setIsConverting(true);
    setProgress(0);
    
    try {
      setProgress(10);
      toast({
        title: "🚀 Using LibreOffice Backend...",
        description: "Converting PDF to PowerPoint",
      });

      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);
      
      const response = await fetch('http://localhost:5000/api/convert/pdf-to-pptx', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Conversion failed');
      }

      setProgress(80);
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '.pptx');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast({
        title: "✅ Conversion Complete!",
        description: "PDF converted to PowerPoint successfully",
      });
      
      setIsConverting(false);
    } catch (error) {
      console.error('Python backend error:', error);
      setIsConverting(false);
      setProgress(0);
      
      toast({
        title: "❌ Conversion Failed",
        description: error instanceof Error ? error.message : 'Make sure Python backend is running on port 5000',
        variant: "destructive",
      });
    }
  };

  return (
    <ConversionTemplate
        title="Convert PDF to POWERPOINT"
        description="Transform PDF pages into PowerPoint slides as images"
        acceptedFormats=".pdf"
        infoText="Upload your PDF file. Each page will become a slide with a high-quality image."
        cloudFunctionName="pdf-to-powerpoint"
        onClientConversion={handlePythonConversion}
        features={[
          "🖼️ High-quality image conversion (300 DPI)",
          "📄 Each PDF page becomes one slide",
          "📊 Perfect visual preservation",
          "⚡ Fast Python backend processing",
          "🔒 Secure conversion",
          "💾 Standard PPTX format",
          "✅ Works with any PDF",
          "📐 Auto-fits to slide dimensions",
          "🎨 Maintains colors and graphics",
          "💡 Best for presentations and visual content"
        ]}
        steps={[
          "Upload your PDF file",
          "Click 'Convert File' to start",
          "PDF pages converted to images",
          "Images inserted into PowerPoint slides",
          "Download your PPTX file"
        ]}
        forceCloudConversion={false}
      />
  );
};

export default PDFToPowerPoint;
