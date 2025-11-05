import { ConversionTemplate } from "@/components/ConversionTemplate";
import { useToast } from "@/hooks/use-toast";

const ExcelToPDF = () => {
  const { toast } = useToast();

  const handlePythonConversion = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/convert/excel-to-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Conversion failed');
      }

      // Download the PDF file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.(xls|xlsx|csv)$/i, '.pdf');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      const fileType = file.name.endsWith('.csv') ? 'CSV' : 'Excel';
      toast({
        title: "Success!",
        description: `${fileType} converted to PDF successfully. Downloaded as ${a.download}`,
      });
    } catch (error: any) {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert file to PDF",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <ConversionTemplate
      title="Convert EXCEL/CSV to PDF"
      description="Transform Excel spreadsheets and CSV files to professional PDF documents"
      acceptedFormats=".xls,.xlsx,.csv"
      infoText="Upload Excel or CSV files. Powered by Microsoft Excel COM for iLovePDF-quality conversion."
      cloudFunctionName="excel-to-pdf"
      onClientConversion={handlePythonConversion}
      features={[
        "🎯 iLovePDF Quality - Microsoft Excel COM",
        "📊 CSV Support - Auto-formatted tables",
        "🏦 Bank logos & images preserved",
        "📐 All columns visible (Landscape auto)",
        "🎨 Perfect formatting preservation",
        "📋 Tables structure maintained",
        "⚡ Fast Python backend processing",
        "🔒 Secure local conversion",
        "💾 Professional PDF output",
        "✨ Pixel-perfect quality"
      ]}
      steps={[
        "Upload Excel (.xlsx, .xls) or CSV (.csv) file",
        "Click 'Convert File' to start",
        "CSV auto-converts to formatted Excel",
        "Microsoft Excel COM creates pixel-perfect PDF",
        "Download your professional PDF file"
      ]}
      forceCloudConversion={false}
    />
  );
};

export default ExcelToPDF;
