import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-2xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  const sizes = size === "sm" ? "px-3.5 py-1.5 text-sm" : "px-5 py-2.5 text-sm";
  const variants: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary:
      "bg-primary-tint text-primary-dark hover:bg-[#d3e6e3] border border-border",
    ghost: "text-foreground hover:bg-primary-tint",
    danger: "bg-danger-tint text-danger hover:bg-[#f5d8d5]",
  };
  return (
    <button className={`${base} ${sizes} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  className = "",
  ...props
}: {
  label?: string;
  error?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-foreground mb-1.5">{label}</span>
      )}
      <input
        className={`w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  );
}

export function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: {
  label?: string;
  error?: string;
  className?: string;
  children: ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-foreground mb-1.5">{label}</span>
      )}
      <select
        className={`w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  );
}

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: {
  label?: string;
  error?: string;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-foreground mb-1.5">{label}</span>
      )}
      <textarea
        className={`w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  );
}

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: "bg-warning-tint text-warning",
  CONFIRMED: "bg-primary-tint text-primary-dark",
  CHECKED_IN: "bg-accent-tint text-accent-dark",
  IN_CONSULTATION: "bg-accent-tint text-accent-dark",
  COMPLETED: "bg-success-tint text-success",
  CANCELLED: "bg-danger-tint text-danger",
  NO_SHOW: "bg-danger-tint text-danger",
};

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked in",
  IN_CONSULTATION: "In consultation",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status] || "bg-primary-tint text-primary-dark"}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function TokenBadge({ number, size = "md" }: { number: number; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
  };
  return (
    <div
      className={`token-badge flex flex-col items-center justify-center font-display font-semibold text-primary-dark ${sizes[size]}`}
    >
      <span className="text-[9px] uppercase tracking-wider text-muted font-sans -mb-1">
        token
      </span>
      {number}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-center py-12 px-6">
      {/* Subtle medical cross illustration */}
      <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-primary-tint flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="11" y="4" width="6" height="20" rx="2" fill="var(--primary)" opacity="0.35" />
          <rect x="4" y="11" width="20" height="6" rx="2" fill="var(--primary)" opacity="0.35" />
        </svg>
      </div>
      <p className="font-display text-lg text-foreground">{title}</p>
      {hint && <p className="text-sm text-muted mt-1 max-w-xs mx-auto">{hint}</p>}
    </div>
  );
}

/** A small metric card used in dashboards */
export function StatCard({
  icon,
  label,
  value,
  sub,
  color = "primary",
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "primary" | "success" | "warning" | "danger" | "accent";
}) {
  const colors: Record<string, string> = {
    primary: "bg-primary-tint text-primary",
    success: "bg-success-tint text-success",
    warning: "bg-warning-tint text-warning",
    danger: "bg-danger-tint text-danger",
    accent: "bg-accent-tint text-accent-dark",
  };
  return (
    <Card className="p-5 hover:shadow-md transition-shadow cursor-default">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="font-display text-2xl text-foreground leading-none mb-1">{value}</p>
      <p className="text-xs text-muted">{label}</p>
      {sub && <p className="text-xs text-muted mt-0.5 opacity-70">{sub}</p>}
    </Card>
  );
}
