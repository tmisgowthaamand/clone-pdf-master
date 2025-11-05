import { useState, useRef } from "react";
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
  Sparkles,
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
    href: "/pdf-to-word",
  },
  {
    icon: Presentation,
    title: "PDF to PowerPoint",
    description: "Turn your PDF files into easy to edit PPT and PPTX slideshows.",
    iconColor: "bg-gradient-to-br from-[hsl(10,85%,55%)] to-[hsl(20,80%,60%)]",
    category: "Convert",
    href: "/pdf-to-powerpoint",
  },
  {
    icon: Sheet,
    title: "PDF to Excel",
    description: "Extract data from PDFs into Excel spreadsheets in seconds.",
    iconColor: "bg-gradient-to-br from-[hsl(145,75%,45%)] to-[hsl(155,70%,50%)]",
    category: "Convert",
    href: "/pdf-to-excel",
  },
  {
    icon: FileText,
    title: "Word to PDF",
    description: "Make DOC and DOCX files easy to read by converting them to PDF.",
    iconColor: "bg-gradient-to-br from-[hsl(215,85%,50%)] to-[hsl(225,80%,55%)]",
    category: "Convert",
    href: "/word-to-pdf",
  },
  {
    icon: Presentation,
    title: "PowerPoint to PDF",
    description: "Make PPT and PPTX slideshows easy to view by converting to PDF.",
    iconColor: "bg-gradient-to-br from-[hsl(5,80%,50%)] to-[hsl(15,75%,55%)]",
    category: "Convert",
    href: "/powerpoint-to-pdf",
  },
  {
    icon: Sheet,
    title: "Excel/CSV to PDF",
    description: "Convert Excel spreadsheets and CSV files to professional PDF documents.",
    iconColor: "bg-gradient-to-br from-[hsl(150,70%,40%)] to-[hsl(160,65%,45%)]",
    category: "Convert",
    href: "/excel-to-pdf",
  },
  {
    icon: FileEdit,
    title: "Edit PDF",
    description: "Add text, images, shapes or annotations to your PDF documents.",
    iconColor: "bg-gradient-to-br from-[hsl(280,65%,55%)] to-[hsl(290,60%,60%)]",
    category: "Edit",
    badge: "New",
    href: "/edit-pdf",
  },
  {
    icon: Image,
    title: "PDF to JPG",
    description: "Convert each PDF page into a JPG or extract images from PDF.",
    iconColor: "bg-gradient-to-br from-[hsl(45,95%,55%)] to-[hsl(55,90%,60%)]",
    category: "Convert",
    href: "/pdf-to-jpg",
  },
  {
    icon: Image,
    title: "JPG to PDF",
    description: "Convert JPG images to PDF in seconds with perfect quality.",
    iconColor: "bg-gradient-to-br from-[hsl(40,90%,50%)] to-[hsl(50,85%,55%)]",
    category: "Convert",
    href: "/jpg-to-pdf",
  },
  {
    icon: PenTool,
    title: "Sign PDF",
    description: "Sign documents electronically or request signatures from others.",
    iconColor: "bg-gradient-to-br from-[hsl(200,80%,50%)] to-[hsl(210,75%,55%)]",
    category: "Edit",
    badge: "New",
    href: "/sign-pdf",
  },
  {
    icon: Stamp,
    title: "Watermark PDF",
    description: "Add a watermark or text stamp to your PDF documents.",
    iconColor: "bg-gradient-to-br from-[hsl(270,70%,55%)] to-[hsl(280,65%,60%)]",
    category: "Edit",
    href: "/watermark-pdf",
  },
  {
    icon: RotateCw,
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them. You can rotate pages individually.",
    iconColor: "bg-gradient-to-br from-[hsl(320,75%,55%)] to-[hsl(330,70%,60%)]",
    category: "Organize",
    href: "/rotate-pdf",
  },
  {
    icon: Code,
    title: "HTML to PDF",
    description: "Convert webpages in HTML to PDF. Copy and paste the URL to convert.",
    iconColor: "bg-gradient-to-br from-[hsl(25,85%,50%)] to-[hsl(35,80%,55%)]",
    category: "Convert",
    href: "/html-to-pdf",
  },
  {
    icon: Unlock,
    title: "Unlock PDF",
    description: "Remove PDF password security, giving you freedom to use your PDFs.",
    iconColor: "bg-gradient-to-br from-[hsl(195,85%,50%)] to-[hsl(205,80%,55%)]",
    category: "Security",
    href: "/unlock-pdf",
  },
  {
    icon: Lock,
    title: "Protect PDF",
    description: "Protect PDF files with a password to prevent unauthorized access.",
    iconColor: "bg-gradient-to-br from-[hsl(235,75%,55%)] to-[hsl(245,70%,60%)]",
    category: "Security",
    href: "/protect-pdf",
  },
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const toolsRef = useRef<HTMLDivElement>(null);

  const filteredTools = activeCategory === "All" 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);

  const scrollToTools = () => {
    toolsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Enhanced Animations */}
      <header className="border-b border-border/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 animate-slide-in-left shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-xl animate-gradient">
              <FileText className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              PDFTools
            </span>
          </div>
          <div className="flex items-center gap-3 animate-slide-in-right">
            <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform duration-300 font-semibold">Login</Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:scale-105 hover:shadow-xl transition-all duration-300 animate-gradient font-semibold text-white">
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Premium Design */}
      <section className="container mx-auto px-4 py-20 md:py-28 text-center relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated Background Blobs with Float Effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/30 to-orange-400/30 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-br from-purple-400/25 to-cyan-400/25 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          
          {/* Enhanced Floating Particles */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-500/50 rounded-full animate-particle shadow-lg" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-500/50 rounded-full animate-particle shadow-lg" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-pink-500/50 rounded-full animate-particle shadow-lg" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-2/3 right-1/4 w-4 h-4 bg-cyan-500/50 rounded-full animate-particle shadow-lg" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 right-1/2 w-3 h-3 bg-orange-500/50 rounded-full animate-particle shadow-lg" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/2 left-2/3 w-4 h-4 bg-green-500/50 rounded-full animate-particle shadow-lg" style={{animationDelay: '5s'}}></div>
          <div className="absolute top-1/5 right-1/5 w-3 h-3 bg-indigo-500/50 rounded-full animate-particle shadow-lg" style={{animationDelay: '6s'}}></div>
          <div className="absolute bottom-1/5 left-1/5 w-4 h-4 bg-rose-500/50 rounded-full animate-particle shadow-lg" style={{animationDelay: '7s'}}></div>
        </div>
        
        {/* Animated Decorative Icons */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <FileText className="absolute top-32 left-20 w-16 h-16 text-blue-500/15 animate-float-slow" />
          <Combine className="absolute top-40 right-32 w-14 h-14 text-purple-500/15 animate-wiggle" style={{animationDelay: '1s'}} />
          <Lock className="absolute bottom-40 left-32 w-12 h-12 text-pink-500/15 animate-bounce-continuous" style={{animationDelay: '0.5s'}} />
          <Image className="absolute bottom-32 right-40 w-14 h-14 text-orange-500/15 animate-float" style={{animationDelay: '2s'}} />
          <Sparkles className="absolute top-1/4 right-1/4 w-10 h-10 text-yellow-500/15 animate-spin-slow" style={{animationDelay: '1.5s'}} />
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight animate-blur-in animate-gradient tracking-tight">
          Every tool you need to work with PDFs
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed animate-slide-up-fade font-normal" style={{animationDelay: '0.2s'}}>
          All the PDF tools you need at your fingertips. <span className="font-semibold">100% free and easy to use!</span> Merge, split, compress, convert, rotate, and secure PDFs with just a few clicks.
        </p>
        <div className="animate-bounce-in" style={{animationDelay: '0.4s'}}>
          <Button 
            onClick={scrollToTools}
            size="lg" 
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 hover:scale-105 transition-all duration-300 text-base md:text-lg px-8 md:px-10 py-6 h-auto group shadow-xl hover:shadow-2xl font-semibold rounded-lg animate-gradient animate-button-pulse" 
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* Category Tabs */}
      <section ref={toolsRef} className="container mx-auto px-4 pt-8">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </section>

      {/* Tools Grid with Advanced Staggered Animation */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => (
            <div 
              key={`${tool.title}-${index}`}
              className="animate-slide-up-fade hover:animate-zoom"
              style={{animationDelay: `${index * 0.08}s`}}
            >
              <ToolCard
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                iconColor={tool.iconColor}
                badge={tool.badge}
                href={tool.href}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-border/50 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-gradient">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              PDFTools
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">© 2024 PDFTools. All rights reserved.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Made with ❤️ for PDF enthusiasts</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
