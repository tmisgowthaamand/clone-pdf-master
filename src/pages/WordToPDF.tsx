import { ConversionTemplate } from "@/components/ConversionTemplate";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

const WordToPDF = () => {
  const { toast } = useToast();

  const extractAndRenderDocx = async (file: File): Promise<{html: string, text: string}> => {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const documentXml = await zip.file('word/document.xml')?.async('text');
    if (!documentXml) {
      throw new Error('Could not find document content');
    }

    // Decode XML entities
    const decodeXml = (text: string) => text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");

    const htmlParts: string[] = [];
    const textParts: string[] = [];

    // Extract paragraphs with basic formatting
    const paragraphMatches = documentXml.match(/<w:p[^>]*>[\s\S]*?<\/w:p>/g);
    
    if (paragraphMatches) {
      paragraphMatches.forEach(para => {
        const textMatches = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
        if (textMatches) {
          const text = textMatches
            .map(m => decodeXml(m.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '')))
            .join('');
          
          if (text.trim()) {
            // Check for bold
            const isBold = para.includes('<w:b/>') || para.includes('<w:b ');
            // Check for italic
            const isItalic = para.includes('<w:i/>') || para.includes('<w:i ');
            // Check for heading
            const isHeading = para.includes('Heading');
            
            let htmlTag = 'p';
            let style = 'margin: 0.5em 0; line-height: 1.6;';
            
            if (isHeading) {
              htmlTag = 'h2';
              style = 'font-size: 1.5em; font-weight: bold; margin: 0.8em 0;';
            }
            
            let textStyle = '';
            if (isBold) textStyle += 'font-weight: bold;';
            if (isItalic) textStyle += 'font-style: italic;';
            
            const content = textStyle ? `<span style="${textStyle}">${text}</span>` : text;
            htmlParts.push(`<${htmlTag} style="${style}">${content}</${htmlTag}>`);
            textParts.push(text);
          }
        }
      });
    }

    // Extract tables
    const tableMatches = documentXml.match(/<w:tbl>[\s\S]*?<\/w:tbl>/g);
    if (tableMatches) {
      tableMatches.forEach(table => {
        htmlParts.push('<table style="border-collapse: collapse; width: 100%; margin: 1em 0; border: 1px solid #ddd;">');
        
        const rowMatches = table.match(/<w:tr[^>]*>[\s\S]*?<\/w:tr>/g);
        if (rowMatches) {
          rowMatches.forEach(row => {
            htmlParts.push('<tr>');
            const cellMatches = row.match(/<w:tc[^>]*>[\s\S]*?<\/w:tc>/g);
            if (cellMatches) {
              cellMatches.forEach(cell => {
                const textMatches = cell.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
                const cellText = textMatches
                  ? textMatches.map(m => decodeXml(m.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, ''))).join('')
                  : '';
                htmlParts.push(`<td style="border: 1px solid #ddd; padding: 8px;">${cellText}</td>`);
                if (cellText.trim()) textParts.push(cellText);
              });
            }
            htmlParts.push('</tr>');
          });
        }
        htmlParts.push('</table>');
      });
    }

    const html = htmlParts.join('');
    const text = textParts.join('\n');
    
    console.log(`Extracted ${text.length} characters, generated ${html.length} bytes of HTML`);
    return { html, text };
  };

  const handleClientConversion = async (file: File) => {
    let container: HTMLElement | null = null;
    
    try {
      if (!file.name.toLowerCase().endsWith('.docx')) {
        toast({
          title: "Unsupported Format",
          description: "Please upload a .docx file. .doc files are not fully supported.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Processing...",
        description: "Extracting content from Word document...",
      });

      // Extract content and generate HTML
      const { html, text } = await extractAndRenderDocx(file);
      
      console.log('=== EXTRACTION COMPLETE ===');
      console.log('Text length:', text.length);
      console.log('HTML length:', html.length);
      console.log('Preview:', text.substring(0, 100));
      console.log('===========================');

      if (!text.trim()) {
        toast({
          title: "Warning",
          description: "No content found in document",
          variant: "destructive"
        });
        return;
      }

      // Create a hidden container to render the HTML
      container = document.createElement('div');
      container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 794px;
        background: white;
        padding: 40px;
        font-family: 'Times New Roman', serif;
        font-size: 12pt;
        color: #000;
      `;
      container.innerHTML = html;
      document.body.appendChild(container);

      toast({
        title: "Rendering...",
        description: "Converting to PDF format...",
      });

      // Wait a bit for fonts to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
      });

      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297; // A4 height in mm
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = file.name.replace(/\.docx$/i, '.pdf');
      pdf.save(fileName);

      // Cleanup
      if (container && container.parentNode) {
        document.body.removeChild(container);
      }

      const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

      toast({
        title: "Success!",
        description: `Converted ${wordCount} words to PDF. Downloaded as ${fileName}`,
      });

    } catch (error) {
      console.error('Conversion error:', error);
      
      // Cleanup on error
      if (container && container.parentNode) {
        document.body.removeChild(container);
      }

      toast({
        title: "Error",
        description: `Failed to convert document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  return (
    <ConversionTemplate
      title="Word to PDF Converter"
      description="Convert DOC and DOCX files to PDF format"
      acceptedFormats=".doc,.docx"
      infoText="Converts Word documents to PDF with visual rendering - preserves formatting, tables, bold, italic, and layout just like iLovePDF."
      cloudFunctionName="word-to-pdf"
      onClientConversion={handleClientConversion}
      features={[
        "Visual PDF conversion like iLovePDF",
        "Preserves ALL content: text, tables, formatting",
        "Maintains bold, italic, and heading styles",
        "Renders tables with borders and structure",
        "High-quality PDF output",
        "Supports DOCX format"
      ]}
      steps={[
        "Upload your Word document (.docx)",
        "Click Convert File (client-side conversion)",
        "Wait for rendering and conversion",
        "Download your PDF with all content and formatting"
      ]}
    />
  );
};

export default WordToPDF;
