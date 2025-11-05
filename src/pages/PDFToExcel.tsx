import { ConversionTemplate } from "@/components/ConversionTemplate";
import { useToast } from "@/hooks/use-toast";

const PDFToExcel = () => {
  const { toast } = useToast();

  const handlePythonConversion = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/convert/pdf-to-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Conversion failed');
      }

      // Download the Excel file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '.xlsx');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success!",
        description: `PDF converted to Excel successfully. Downloaded as ${a.download}`,
      });
    } catch (error: any) {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert PDF to Excel",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <ConversionTemplate
      title="Convert PDF to EXCEL"
      description="Extract tables from PDF to Excel with iLovePDF-like quality"
      acceptedFormats=".pdf"
      infoText="Upload a PDF with tables. Powered by Camelot for professional-grade table extraction."
      cloudFunctionName="pdf-to-excel"
      onClientConversion={handlePythonConversion}
      features={[
        "🎯 Camelot-Powered - iLovePDF Quality",
        "📊 Perfect table extraction (100% accuracy)",
        "📐 Preserves column structure and layout",
        "📋 Combines all tables in single sheet",
        "🎨 Auto-sized columns for readability",
        "⚡ Fast Python backend processing",
        "🔒 Secure local conversion",
        "💾 Standard XLSX format",
        "🏦 Perfect for bank statements & reports",
        "✨ No data loss - exact extraction"
      ]}
      steps={[
        "Upload your PDF file with tables",
        "Click 'Convert File' to start",
        "Camelot extracts tables with 100% accuracy",
        "All tables combined in single Excel sheet",
        "Download your perfectly formatted XLSX file"
      ]}
      forceCloudConversion={false}
    />
  );
};

export default PDFToExcel;
