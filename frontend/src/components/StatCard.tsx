import {
  Users,
  FileText,
  FolderOpen,
  Database,
  Download,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'flat';
  icon: string;
  color: string;
}

const iconMap: Record<string, typeof Users> = {
  Users,
  FileText,
  FolderOpen,
  Database,
  Download,
  Clock,
};

const colorStyles: Record<string, { bg: string; text: string; ring: string; gradient: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100', gradient: 'from-blue-500/10' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', gradient: 'from-emerald-500/10' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100', gradient: 'from-amber-500/10' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100', gradient: 'from-violet-500/10' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', gradient: 'from-rose-500/10' },
};

export default function StatCard({ label, value, change, trend, icon, color }: StatCardProps) {
  const Icon = iconMap[icon] || FileText;
  const styles = colorStyles[color] || colorStyles.blue;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-500' : 'text-slate-400';

  return (
    <div className="relative group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-200 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${styles.bg} ${styles.text} flex items-center justify-center ring-4 ${styles.ring}`}>
          <Icon className="w-5 h-5" strokeWidth={2.2} />
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-semibold ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          {change}
        </div>
      </div>
      <div className="relative">
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
        <p className="text-[13px] text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}
