import { useCallback } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
}

export const FileUpload = ({ 
  onFilesSelected, 
  accept = ".pdf", 
  multiple = false,
  maxSize = 50 * 1024 * 1024 // 50MB
}: FileUploadProps) => {
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.includes('pdf') && !accept.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid file type`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${maxSize / (1024 * 1024)}MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [accept, maxSize, onFilesSelected, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative text-center transition-all"
      style={{
        padding: '60px 20px',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        id="file-upload-input"
        className="hidden"
      />
      
      {/* iLovePDF-style button */}
      <label
        htmlFor="file-upload-input"
        className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
        style={{
          backgroundColor: '#E62B1E',
          fontSize: '16px',
          marginBottom: '20px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#CC2619';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#E62B1E';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" strokeLinecap="round" strokeWidth="2" stroke="#fff" fill="none" strokeLinejoin="round">
          <path d="M10 1.833v16.333"></path>
          <path d="M1.833 10h16.333"></path>
        </svg>
        <span>Select POWERPOINT files</span>
      </label>
      
      {/* Drop text */}
      <p className="text-base" style={{ color: '#6B7280', marginBottom: '10px' }}>
        or drop POWERPOINT slideshows here
      </p>
      
      <p className="text-sm" style={{ color: '#9CA3AF' }}>
        Supports .ppt, .pptx • Max {maxSize / (1024 * 1024)}MB
      </p>
    </div>
  );
};
