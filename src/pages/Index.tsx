import { useState, useRef } from "react";
import { ToolCard } from "@/components/ToolCard";
import { CategoryTabs } from "@/components/CategoryTabs";
import { AnimatedText } from "@/components/AnimatedText";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/10" style={{ willChange: 'auto' }}>
      {/* Header with Enhanced Animations */}
      <header className="border-b border-border/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 animate-slide-in-left shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-xl animate-gradient">
              <FileText className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent animate-gradient leading-none">
              PDFTools
            </span>
          </div>
          <div className="flex items-center gap-3 animate-slide-in-right">
            <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform duration-300 font-semibold hidden sm:inline-flex h-10">Login</Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:scale-105 hover:shadow-xl transition-all duration-300 animate-gradient font-semibold text-white h-10">
              Sign up
            </Button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <ThemeToggle inline />
          </div>
        </div>
      </header>

      {/* Hero Section with Premium Design */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28 text-center relative overflow-hidden bg-mesh-gradient bg-animated-grid">
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
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 holographic leading-tight animate-blur-in tracking-tight perspective-container">
          <span className="layer-3d-3">Every tool you need to work with PDFs</span>
        </h1>
        <div className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in-up font-normal" style={{animationDelay: '0.2s'}}>
          <AnimatedText 
            text="All the PDF tools you need at your fingertips." 
            type="blur"
            className="inline"
          />
          {" "}
          <span className="font-semibold animate-gradient-text">100% free and easy to use!</span>
          {" "}
          <AnimatedText 
            text="Merge, split, compress, convert, rotate, and secure PDFs with just a few clicks." 
            type="split"
            className="inline"
            delay={500}
          />
        </div>
        <div className="animate-bounce-in flex justify-center" style={{animationDelay: '0.4s'}}>
          <Button 
            onClick={scrollToTools}
            size="lg" 
            className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-pink-700 hover:scale-105 transition-all duration-300 text-base md:text-lg px-8 md:px-10 py-6 h-auto group shadow-xl hover:shadow-2xl font-semibold rounded-lg animate-gradient animate-button-pulse" 
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

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Why Choose PDFTools?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The most powerful and easy-to-use PDF tools, completely free
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto perspective-container">
          {/* Feature 1 - 3D Card */}
          <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-3d hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 tilt-3d glass-3d">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-morph"></div>
            <div className="relative layer-3d-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 animate-pulse-3d animate-glow-3d">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white neon-glow">100% Free</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                All tools are completely free to use. No hidden fees, no subscriptions, no limits.
              </p>
            </div>
          </div>

          {/* Feature 2 - 3D Card */}
          <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-3d hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 tilt-3d glass-3d">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-morph"></div>
            <div className="relative layer-3d-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 animate-pulse-3d animate-glow-3d">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white neon-glow">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Your files are processed securely and deleted automatically. We respect your privacy.
              </p>
            </div>
          </div>

          {/* Feature 3 - 3D Card */}
          <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-3d hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 tilt-3d glass-3d">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-morph"></div>
            <div className="relative layer-3d-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 animate-pulse-3d animate-glow-3d">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white neon-glow">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Process your PDFs in seconds with our optimized tools. No waiting, just results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-3xl my-20 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
          <div className="space-y-2">
            <div className="text-5xl font-bold">17+</div>
            <div className="text-xl opacity-90">PDF Tools</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-bold">100%</div>
            <div className="text-xl opacity-90">Free Forever</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-bold">∞</div>
            <div className="text-xl opacity-90">Unlimited Usage</div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-border/50 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg animate-gradient">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  PDFTools
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Your all-in-one solution for PDF management. Fast, secure, and completely free.
              </p>
            </div>

            {/* Tools Column */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Popular Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/merge-pdf" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Merge PDF</a></li>
                <li><a href="/compress-pdf" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Compress PDF</a></li>
                <li><a href="/pdf-to-word" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">PDF to Word</a></li>
                <li><a href="/protect-pdf" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Protect PDF</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">© 2025 PDFTools. All rights reserved.</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Made with ❤️ for PDF enthusiasts worldwide</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
