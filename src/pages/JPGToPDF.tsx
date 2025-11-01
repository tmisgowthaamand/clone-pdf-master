import { ConversionTemplate } from "@/components/ConversionTemplate";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from 'jspdf';

const JPGToPDF = () => {
  const { toast } = useToast();

  const handleClientConversion = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const doc = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [img.width, img.height]
          });
          
          doc.addImage(img, 'JPEG', 0, 0, img.width, img.height);
          
          const fileName = file.name.replace(/\.(jpg|jpeg|png)$/i, '.pdf');
          doc.save(fileName);
          
          toast({
            title: "Success!",
            description: `Image converted to PDF. Downloaded as ${fileName}`,
          });
          
          resolve();
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  return (
    <ConversionTemplate
      title="JPG to PDF Converter"
      description="Convert JPG and PNG images to PDF format"
      acceptedFormats=".jpg,.jpeg,.png"
      infoText="Converts image files to PDF format. Automatically adjusts PDF size to match image dimensions."
      cloudFunctionName="jpg-to-pdf"
      onClientConversion={handleClientConversion}
      features={[
        "Supports JPG, JPEG, and PNG",
        "Preserves image quality",
        "Auto-adjusts page size",
        "Fast conversion"
      ]}
      steps={[
        "Upload your image file",
        "Choose conversion method",
        "Click Convert File",
        "Download your PDF file"
      ]}
    />
  );
};

export default JPGToPDF;
