import { ConversionTemplate } from "@/components/ConversionTemplate";
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';

const WordToPDF = () => {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePythonConversion = async (file: File) => {
    setIsConverting(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);
      
      const response = await fetch('http://localhost:5000/api/convert/docx-to-pdf', {
        method: 'POST',
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Conversion failed');
      }

      const blob = await response.blob();
      setProgress(90);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.(doc|docx)$/i, '.pdf');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setProgress(100);

      toast({
        title: "Success!",
        description: `Converted ${file.name} to PDF using Python backend`,
      });

    } catch (error) {
      console.error('Python backend error:', error);
      toast({
        title: "Error",
        description: `Python backend error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };


  return (
    <ConversionTemplate
      title="Word to PDF Converter"
      description="Convert DOC and DOCX files to PDF format"
      acceptedFormats=".doc,.docx"
      infoText="Converts Word documents to PDF using LibreOffice backend - preserves formatting, tables, images, and layout just like iLovePDF."
      cloudFunctionName="word-to-pdf"
      onClientConversion={handlePythonConversion}
      features={[
        "🚀 LibreOffice Backend - Professional Quality",
        "📄 Supports both .doc and .docx files",
        "💎 Perfect conversion - same as Microsoft Word",
        "📐 Preserves ALL content: text, tables, images, formatting",
        "🎨 Maintains fonts, colors, and styles",
        "📊 Tables and charts preserved",
        "High-quality PDF output"
      ]}
      steps={[
        "Upload your Word document (.doc or .docx)",
        "Click Convert File (Python backend)",
        "Wait for LibreOffice conversion",
        "Download your professional PDF"
      ]}
    />
  );
};

export default WordToPDF;
