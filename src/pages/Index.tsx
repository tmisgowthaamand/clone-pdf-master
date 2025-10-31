import { useState } from "react";
import { ToolCard } from "@/components/ToolCard";
import { CategoryTabs } from "@/components/CategoryTabs";
import { Button } from "@/components/ui/button";
import {
  Combine,
  Split,
  Minimize2,
  FileText,
  Presentation,
  Sheet,
  FileEdit,
  Image,
  RotateCw,
  Lock,
  Unlock,
  Stamp,
  PenTool,
  Code,
  ArrowRight,
} from "lucide-react";

const categories = ["All", "Organize", "Optimize", "Convert", "Edit", "Security"];

const tools = [
  {
    icon: Combine,
    title: "Merge PDF",
    description: "Combine multiple PDFs in the order you want with our easy merger.",
    iconColor: "bg-gradient-to-br from-[hsl(200,95%,45%)] to-[hsl(185,80%,50%)]",
    category: "Organize",
    href: "/merge-pdf",
  },
  {
    icon: Split,
    title: "Split PDF",
    description: "Separate one page or a whole set into independent PDF files.",
    iconColor: "bg-gradient-to-br from-[hsl(15,90%,55%)] to-[hsl(30,85%,50%)]",
    category: "Organize",
    href: "/split-pdf",
  },
  {
    icon: Minimize2,
    title: "Compress PDF",
    description: "Reduce file size while optimizing for maximum PDF quality.",
    iconColor: "bg-gradient-to-br from-[hsl(140,70%,45%)] to-[hsl(160,65%,45%)]",
    category: "Optimize",
    href: "/compress-pdf",
  },
  {
    icon: FileText,
    title: "PDF to Word",
    description: "Convert your PDF files into easy to edit DOC and DOCX documents.",
    iconColor: "bg-gradient-to-br from-[hsl(210,90%,55%)] to-[hsl(220,85%,60%)]",
    category: "Convert",
  },
  {
    icon: Presentation,
    title: "PDF to PowerPoint",
    description: "Turn your PDF files into easy to edit PPT and PPTX slideshows.",
    iconColor: "bg-gradient-to-br from-[hsl(10,85%,55%)] to-[hsl(20,80%,60%)]",
    category: "Convert",
  },
  {
    icon: Sheet,
    title: "PDF to Excel",
    description: "Extract data from PDFs into Excel spreadsheets in seconds.",
    iconColor: "bg-gradient-to-br from-[hsl(145,75%,45%)] to-[hsl(155,70%,50%)]",
    category: "Convert",
  },
  {
    icon: FileText,
    title: "Word to PDF",
    description: "Make DOC and DOCX files easy to read by converting them to PDF.",
    iconColor: "bg-gradient-to-br from-[hsl(215,85%,50%)] to-[hsl(225,80%,55%)]",
    category: "Convert",
  },
  {
    icon: Presentation,
    title: "PowerPoint to PDF",
    description: "Make PPT and PPTX slideshows easy to view by converting to PDF.",
    iconColor: "bg-gradient-to-br from-[hsl(5,80%,50%)] to-[hsl(15,75%,55%)]",
    category: "Convert",
  },
  {
    icon: Sheet,
    title: "Excel to PDF",
    description: "Make Excel spreadsheets easy to read by converting them to PDF.",
    iconColor: "bg-gradient-to-br from-[hsl(150,70%,40%)] to-[hsl(160,65%,45%)]",
    category: "Convert",
  },
  {
    icon: FileEdit,
    title: "Edit PDF",
    description: "Add text, images, shapes or annotations to your PDF documents.",
    iconColor: "bg-gradient-to-br from-[hsl(280,65%,55%)] to-[hsl(290,60%,60%)]",
    category: "Edit",
    badge: "New",
  },
  {
    icon: Image,
    title: "PDF to JPG",
    description: "Convert each PDF page into a JPG or extract images from PDF.",
    iconColor: "bg-gradient-to-br from-[hsl(45,95%,55%)] to-[hsl(55,90%,60%)]",
    category: "Convert",
  },
  {
    icon: Image,
    title: "JPG to PDF",
    description: "Convert JPG images to PDF in seconds with perfect quality.",
    iconColor: "bg-gradient-to-br from-[hsl(40,90%,50%)] to-[hsl(50,85%,55%)]",
    category: "Convert",
  },
  {
    icon: PenTool,
    title: "Sign PDF",
    description: "Sign documents electronically or request signatures from others.",
    iconColor: "bg-gradient-to-br from-[hsl(200,80%,50%)] to-[hsl(210,75%,55%)]",
    category: "Edit",
  },
  {
    icon: Stamp,
    title: "Watermark PDF",
    description: "Add a watermark or text stamp to your PDF documents.",
    iconColor: "bg-gradient-to-br from-[hsl(270,70%,55%)] to-[hsl(280,65%,60%)]",
    category: "Edit",
  },
  {
    icon: RotateCw,
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them. You can rotate pages individually.",
    iconColor: "bg-gradient-to-br from-[hsl(320,75%,55%)] to-[hsl(330,70%,60%)]",
    category: "Organize",
  },
  {
    icon: Code,
    title: "HTML to PDF",
    description: "Convert webpages in HTML to PDF. Copy and paste the URL to convert.",
    iconColor: "bg-gradient-to-br from-[hsl(25,85%,50%)] to-[hsl(35,80%,55%)]",
    category: "Convert",
  },
  {
    icon: Unlock,
    title: "Unlock PDF",
    description: "Remove PDF password security, giving you freedom to use your PDFs.",
    iconColor: "bg-gradient-to-br from-[hsl(195,85%,50%)] to-[hsl(205,80%,55%)]",
    category: "Security",
  },
  {
    icon: Lock,
    title: "Protect PDF",
    description: "Protect PDF files with a password to prevent unauthorized access.",
    iconColor: "bg-gradient-to-br from-[hsl(235,75%,55%)] to-[hsl(245,70%,60%)]",
    category: "Security",
  },
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTools = activeCategory === "All" 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PDFTools
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Login</Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
          Every tool you need to work with PDFs
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
          All the PDF tools you need at your fingertips. 100% free and easy to use! 
          Merge, split, compress, convert, rotate, and secure PDFs with just a few clicks.
        </p>
        <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 h-12 group">
          Get Started
          <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </section>

      {/* Category Tabs */}
      <section className="container mx-auto px-4">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </section>

      {/* Tools Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => (
            <ToolCard
              key={`${tool.title}-${index}`}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              iconColor={tool.iconColor}
              badge={tool.badge}
              href={tool.href}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 PDFTools. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
