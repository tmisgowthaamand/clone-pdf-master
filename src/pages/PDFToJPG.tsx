import { useEffect } from "react";
import { ConversionTemplate } from "@/components/ConversionTemplate";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const PDFToJPG = () => {
  const { toast } = useToast();

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  }, []);

  const handleClientConversion = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    
    const zip = new JSZip();
    
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95);
      });
      
      zip.file(`page-${pageNum}.jpg`, blob);
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const fileName = file.name.replace('.pdf', '-images.zip');
    saveAs(zipBlob, fileName);

    toast({
      title: "Success!",
      description: `PDF converted to ${pdfDoc.numPages} JPG images. Downloaded as ${fileName}`,
    });
  };

  return (
    <ConversionTemplate
      title="PDF to JPG Converter"
      description="Convert PDF pages to JPG images"
      acceptedFormats=".pdf"
      infoText="Converts each PDF page into a high-quality JPG image. All images are packaged in a ZIP file."
      cloudFunctionName="pdf-to-jpg"
      onClientConversion={handleClientConversion}
      features={[
        "High-quality JPG output",
        "Each page becomes an image",
        "All images in one ZIP file",
        "Preserves visual quality"
      ]}
      steps={[
        "Upload your PDF file",
        "Choose conversion method",
        "Click Convert File",
        "Download ZIP with JPG images"
      ]}
    />
  );
};

export default PDFToJPG;
