import { useState } from "react";
import { ConversionTemplate } from "@/components/ConversionTemplate";
import { useToast } from "@/hooks/use-toast";

const PDFToWord = () => {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePythonConversion = async (file: File) => {
    setIsConverting(true);
    setProgress(0);
    
    try {
      setProgress(10);
      toast({
        title: "🚀 Using pdf2docx Library...",
        description: "Converting PDF to Word with layout preservation",
      });

      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);
      
      const response = await fetch('http://localhost:5000/api/convert/pdf-to-docx', {
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
      a.download = file.name.replace(/\.pdf$/i, '.docx');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast({
        title: "✅ Conversion Complete!",
        description: "PDF converted to Word with layout preservation",
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
    <div>
      <div className="max-w-4xl mx-auto mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <h3 className="font-semibold text-lg text-blue-800">PDF to Word - Perfect Visual Preservation</h3>
            <p className="text-sm text-blue-700 mt-1">
              This converter renders each PDF page as a <strong>high-quality image (300 DPI)</strong> in Word - ensuring charts, graphs, and layouts are preserved perfectly.
            </p>
            <div className="mt-3">
                <p className="text-sm font-semibold text-green-700 mb-2">✅ Perfect Preservation:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Charts & graphs</strong> - Preserved exactly as they appear</li>
                  <li>• <strong>Tables & formatting</strong> - Visual layout maintained</li>
                  <li>• <strong>Images & graphics</strong> - High quality (300 DPI)</li>
                  <li>• <strong>Text & fonts</strong> - Rendered as shown in PDF</li>
                  <li>• <strong>Colors & styling</strong> - Exact match</li>
                </ul>
                <p className="text-xs text-yellow-700 mt-3">
                  ⚠️ <strong>Note:</strong> Content is preserved as images - not editable. For editable text/charts, use Adobe Acrobat.
                </p>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              💡 For perfect conversion with editable charts, use <a href="https://www.adobe.com/acrobat/online/pdf-to-word.html" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Adobe Acrobat</a>
            </p>
          </div>
        </div>
      </div>
      <ConversionTemplate
        title="Convert PDF to WORD"
        description="Transform PDF documents into editable Word files with layout preservation"
        acceptedFormats=".pdf"
        infoText="Upload a text-based PDF. The converter will preserve layout, images, and tables."
        cloudFunctionName="pdf-to-word"
        onClientConversion={handlePythonConversion}
        features={[
          "🎯 pdf2docx Library - Better than basic extraction",
          "📐 Layout preservation",
          "🖼️ Images extracted and embedded",
          "📊 Tables structure maintained",
          "🎨 Fonts and colors preserved (where possible)",
          "⚡ Fast Python processing",
          "🔒 Secure conversion",
          "💾 Standard DOCX format",
          "✅ Works with text-based PDFs",
          "🆓 Free and unlimited"
        ]}
        steps={[
          "Upload a text-based PDF file",
          "Click 'Convert File' to start",
          "pdf2docx extracts content with layout",
          "Images and tables are preserved",
          "Download your editable DOCX file"
        ]}
        forceCloudConversion={false}
      />
    </div>
  );
};

export default PDFToWord;
