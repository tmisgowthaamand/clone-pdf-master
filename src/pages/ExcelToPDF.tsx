import { ConversionTemplate } from "@/components/ConversionTemplate";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

const ExcelToPDF = () => {
  const { toast } = useToast();

  const handleClientConversion = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    doc.setFontSize(16);
    doc.text(`Converted from: ${file.name}`, margin, margin);
    
    let y = margin + 15;
    
    workbook.SheetNames.forEach((sheetName, index) => {
      if (index > 0) {
        doc.addPage();
        y = margin;
      }
      
      doc.setFontSize(14);
      doc.text(`Sheet: ${sheetName}`, margin, y);
      y += 10;
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      doc.setFontSize(10);
      data.forEach((row: any[]) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        const rowText = row.join(' | ');
        const lines = doc.splitTextToSize(rowText, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          doc.text(line, margin, y);
          y += 6;
        });
      });
      
      y += 10;
    });

    const fileName = file.name.replace(/\.(xls|xlsx)$/i, '.pdf');
    doc.save(fileName);

    toast({
      title: "Success!",
      description: `Excel converted to PDF. Downloaded as ${fileName}`,
    });
  };

  return (
    <ConversionTemplate
      title="Excel to PDF Converter"
      description="Convert XLS and XLSX files to PDF format"
      acceptedFormats=".xls,.xlsx"
      infoText="Converts Excel spreadsheets to PDF format. Preserves data from all sheets."
      cloudFunctionName="excel-to-pdf"
      onClientConversion={handleClientConversion}
      features={[
        "Supports XLS and XLSX formats",
        "Converts all sheets",
        "Preserves data structure",
        "Creates searchable PDFs"
      ]}
      steps={[
        "Upload your Excel file",
        "Choose conversion method",
        "Click Convert File",
        "Download your PDF file"
      ]}
    />
  );
};

export default ExcelToPDF;
