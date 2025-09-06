import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  loading?: boolean;
}

export default function StatsCard({ title, value, icon: Icon, color, loading }: StatsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="loading-skeleton h-20 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className={`stats-card bg-gradient-to-r ${color} p-6`}>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-white/80 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
          </div>
          <Icon className="w-8 h-8 text-white/60" />
        </div>
      </CardContent>
    </Card>
  );
}
