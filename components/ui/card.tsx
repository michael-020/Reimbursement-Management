import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-100 shadow-sm",
        hover && "hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  iconBg = "bg-amber-50",
}: StatCardProps) {
  const changeColor =
    changeType === "up"
      ? "text-emerald-600"
      : changeType === "down"
      ? "text-red-500"
      : "text-slate-400";

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          {change && (
            <p className={`text-xs mt-2 font-medium ${changeColor}`}>{change}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface BadgeProps {
  status: "approved" | "pending" | "rejected" | "active" | "inactive";
  label?: string;
}

const badgeConfig = {
  approved: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Approved" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  rejected: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", label: "Rejected" },
  active: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500", label: "Active" },
  inactive: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400", label: "Inactive" },
};

export function Badge({ status, label }: BadgeProps) {
  const config = badgeConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || config.label}
    </span>
  );
}