import { useEffect } from "react";
import { ConversionTemplate } from "@/components/ConversionTemplate";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

const PDFToExcel = () => {
  const { toast } = useToast();

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  }, []);

  const handleClientConversion = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;

    const workbook = XLSX.utils.book_new();

    // Process each page
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Group text items by vertical position to detect rows/tables
      const textByY: { [key: number]: any[] } = {};
      
      textContent.items.forEach((item: any) => {
        if (item.str && item.str.trim()) {
          const y = Math.round(item.transform[5]); // Y position
          if (!textByY[y]) {
            textByY[y] = [];
          }
          textByY[y].push({
            text: item.str,
            x: item.transform[4], // X position
            width: item.width
          });
        }
      });

      // Sort by Y position (top to bottom)
      const sortedYPositions = Object.keys(textByY)
        .map(Number)
        .sort((a, b) => b - a); // Descending (top to bottom)

      const pageData: any[][] = [];
      
      // Process each row
      sortedYPositions.forEach(y => {
        const rowItems = textByY[y].sort((a, b) => a.x - b.x); // Sort left to right
        
        // Detect if items are separated (potential table columns)
        const row: string[] = [];
        let currentCell = '';
        let lastX = -1;
        
        rowItems.forEach((item, idx) => {
          const gap = lastX === -1 ? 0 : item.x - lastX;
          
          // If gap is large (>50 units), it's likely a new column
          if (gap > 50 && currentCell.trim()) {
            row.push(currentCell.trim());
            currentCell = item.text;
          } else {
            currentCell += (currentCell ? ' ' : '') + item.text;
          }
          
          lastX = item.x + item.width;
          
          // Push last cell
          if (idx === rowItems.length - 1 && currentCell.trim()) {
            row.push(currentCell.trim());
          }
        });
        
        if (row.length > 0) {
          pageData.push(row);
        }
      });

      // Create worksheet for this page
      if (pageData.length > 0) {
        const worksheet = XLSX.utils.aoa_to_sheet(pageData);
        
        // Auto-size columns
        const colWidths = pageData[0].map((_, colIdx) => {
          const maxLength = Math.max(
            ...pageData.map(row => (row[colIdx] || '').toString().length)
          );
          return { wch: Math.min(maxLength + 2, 50) };
        });
        worksheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${pageNum}`);
      }
    }

    // If no sheets were created, create a summary sheet
    if (workbook.SheetNames.length === 0) {
      const summaryData = [['Info', 'No extractable content found in PDF']];
      const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
    }

    const fileName = file.name.replace('.pdf', '.xlsx');
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Success!",
      description: `PDF converted to Excel with ${workbook.SheetNames.length} sheet(s). Downloaded as ${fileName}`,
    });
  };

  return (
    <ConversionTemplate
      title="PDF to Excel Converter"
      description="Extract data from PDFs into Excel spreadsheets"
      acceptedFormats=".pdf"
      infoText="Extracts structured data and tables from PDFs into Excel spreadsheets with proper formatting. Best for text-based PDFs with tables."
      cloudFunctionName="pdf-to-excel"
      onClientConversion={handleClientConversion}
      features={[
        "Detects and extracts tables from PDFs",
        "Preserves column structure and layout",
        "Creates separate sheets for each page",
        "Auto-sizes columns for readability",
        "Extracts actual data and information"
      ]}
      steps={[
        "Upload your PDF file",
        "Choose conversion method (client-side recommended)",
        "Click Convert File",
        "Download your Excel spreadsheet with structured data"
      ]}
    />
  );
};

export default PDFToExcel;
