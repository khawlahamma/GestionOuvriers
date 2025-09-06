import { LucideIcon } from "lucide-react";
import { 
  Wrench, 
  Zap, 
  Paintbrush, 
  Hammer, 
  Leaf, 
  Home 
} from "lucide-react";
import { Link } from "wouter";

interface ServiceCategoryProps {
  category: {
    id: string;
    name: string;
    icon: string | LucideIcon;
    color: string;
    workerCount: number;
  };
  size?: 'sm' | 'md' | 'lg';
}

const iconMap: Record<string, LucideIcon> = {
  'Wrench': Wrench,
  'Zap': Zap,
  'Paintbrush': Paintbrush,
  'Hammer': Hammer,
  'Leaf': Leaf,
  'Home': Home,
};

export default function ServiceCategory({ category, size = 'md' }: ServiceCategoryProps) {
  const Icon = typeof category.icon === 'string' ? iconMap[category.icon] : category.icon;
  
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      'primary': 'bg-primary/10 text-primary group-hover:bg-primary/20',
      'secondary': 'bg-secondary/10 text-secondary group-hover:bg-secondary/20',
      'success': 'bg-green-500/10 text-green-600 group-hover:bg-green-500/20',
      'warning': 'bg-yellow-500/10 text-yellow-600 group-hover:bg-yellow-500/20',
      'slate-600': 'bg-slate-600/10 text-slate-600 group-hover:bg-slate-600/20',
    };
    return colorMap[color] || 'bg-primary/10 text-primary group-hover:bg-primary/20';
  };

  return (
    <Link href={`/workers?category=${category.id}`}>
      <div className={`service-card ${sizeClasses[size]} cursor-pointer hover:shadow-lg transition-shadow`}>
        <div className={`service-icon ${iconSizeClasses[size]} ${getColorClasses(category.color)}`}>
          {Icon && <Icon className={iconSizeClasses[size]} />}
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">{category.name}</h3>
        <p className="text-sm text-slate-600">{category.workerCount} ouvriers</p>
      </div>
    </Link>
  );
}
