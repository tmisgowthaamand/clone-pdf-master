import { useEffect, useRef } from 'react';

interface PDFEditorProps {
  pdfData: string;
  filename: string;
  onBack?: () => void;
}

export const PDFEditor = ({ pdfData, filename, onBack }: PDFEditorProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    
    // Wait for iframe to load
    iframe.onload = () => {
      // Send PDF data to iframe
      iframe.contentWindow?.postMessage({
        type: 'LOAD_PDF',
        pdfData: pdfData,
        filename: filename
      }, '*');
    };

    // Listen for back button message from iframe
    const handleMessage = (event: MessageEvent) => {
      console.log('Message received in parent:', event.data);
      if (event.data.type === 'GO_BACK') {
        console.log('GO_BACK message received, calling onBack');
        if (onBack) {
          onBack();
        } else {
          console.warn('onBack callback not provided');
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [pdfData, filename, onBack]);

  return (
    <iframe
      ref={iframeRef}
      src="/pdf-editor.html"
      className="w-full h-screen border-0"
      title="PDF Editor"
    />
  );
};
