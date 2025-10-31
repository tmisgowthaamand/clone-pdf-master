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
      className="relative border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer group"
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
      <h3 className="text-lg font-semibold mb-2">Drop your files here</h3>
      <p className="text-muted-foreground">or click to browse</p>
      <p className="text-sm text-muted-foreground mt-2">
        {multiple ? "Multiple files" : "Single file"} • Max {maxSize / (1024 * 1024)}MB
      </p>
    </div>
  );
};
