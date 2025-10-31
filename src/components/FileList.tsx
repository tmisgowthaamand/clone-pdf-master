import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
}

export const FileList = ({ files, onRemove }: FileListProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <Card key={index} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
          >
            <X className="w-4 h-4" />
          </Button>
        </Card>
      ))}
    </div>
  );
};
