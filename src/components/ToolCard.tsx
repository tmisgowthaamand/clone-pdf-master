import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { memo } from "react";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
  badge?: string;
  href?: string;
}

export const ToolCard = memo(({ icon: Icon, title, description, iconColor, badge, href }: ToolCardProps) => {
  const content = (
    <Card className="group relative p-6 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-3 bg-card border-border hover:border-primary/50 overflow-hidden">
      {/* Animated gradient overlay on hover with shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
      
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150"></div>
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-secondary/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150"></div>
      
      {badge && (
        <div className="absolute top-4 right-4 px-2 py-1 rounded-md bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 animate-heartbeat">
          <span className="text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{badge}</span>
        </div>
      )}
      <div className={`relative w-14 h-14 rounded-xl ${iconColor} flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/30`}>
        <Icon className="w-7 h-7 text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
        {/* Icon glow effect */}
        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"></div>
      </div>
      <h3 className="relative text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-all duration-300 group-hover:translate-x-1">{title}</h3>
      <p className="relative text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">{description}</p>
      
      {/* Hover indicator arrow */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
});
