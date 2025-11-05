import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Code } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HTMLToPDF = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  const handleConvert = () => {
    toast({
      title: "Coming Soon",
      description: "HTML to PDF conversion feature will be available soon!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to tools
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              HTML to PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Convert webpages in HTML to PDF. Copy and paste the URL to convert
            </p>
          </div>

          <Card className="mb-6 p-4 bg-orange-50 dark:bg-orange-950 border-orange-200">
            <div className="flex items-start gap-3">
              <Code className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">HTML to PDF</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Convert webpages in HTML to PDF. Copy and paste the URL to convert.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="mt-2"
                  />
                </div>
                
                <div className="text-center text-sm text-muted-foreground">OR</div>
                
                <div>
                  <Label htmlFor="html">Paste HTML Code</Label>
                  <Textarea
                    id="html"
                    placeholder="<html>...</html>"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="mt-2 min-h-[200px] font-mono text-sm"
                  />
                </div>
              </div>
            </Card>
            
            <Button
              onClick={handleConvert}
              disabled={!url && !htmlContent}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-12 text-lg"
            >
              <Code className="w-5 h-5 mr-2" />
              Convert to PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTMLToPDF;
