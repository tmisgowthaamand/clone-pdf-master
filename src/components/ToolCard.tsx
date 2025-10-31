import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
  badge?: string;
  href?: string;
}

export const ToolCard = ({ icon: Icon, title, description, iconColor, badge, href }: ToolCardProps) => {
  const content = (
    <Card className="group relative p-6 cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 bg-card border-border">
      {badge && (
        <div className="absolute top-4 right-4 px-2 py-1 rounded-md bg-accent/10 border border-accent/20">
          <span className="text-xs font-medium text-accent">{badge}</span>
        </div>
      )}
      <div className={`w-14 h-14 rounded-xl ${iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
};
