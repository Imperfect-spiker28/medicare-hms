"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, UserRound, Stethoscope as DoctorIcon, MonitorCheck, ShieldCheck } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";

const ROLE_HOME: Record<string, string> = {
  PATIENT: "/patient",
  DOCTOR: "/doctor",
  RECEPTIONIST: "/reception",
  ADMIN: "/admin",
};

const QUICK_LOGINS = [
  {
    role: "Patient",
    email: "patient@example.com",
    password: "Password@123",
    icon: <UserRound size={16} />,
    color: "border-primary/30 hover:border-primary hover:bg-primary-tint text-primary-dark",
    dot: "bg-primary",
  },
  {
    role: "Doctor",
    email: "doctor1@medicarehospital.in",
    password: "Password@123",
    icon: <DoctorIcon size={16} />,
    color: "border-success/30 hover:border-success hover:bg-success-tint text-success",
    dot: "bg-success",
  },
  {
    role: "Reception",
    email: "reception@medicarehospital.in",
    password: "Password@123",
    icon: <MonitorCheck size={16} />,
    color: "border-accent/30 hover:border-accent hover:bg-accent-tint text-accent-dark",
    dot: "bg-accent",
  },
  {
    role: "Admin",
    email: "admin@medicarehospital.in",
    password: "Password@123",
    icon: <ShieldCheck size={16} />,
    color: "border-warning/30 hover:border-warning hover:bg-warning-tint text-warning",
    dot: "bg-warning",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  async function doLogin(e: string, p: string) {
    setError("");
    try {
      const data = await apiFetch<{ user: { role: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: e, password: p }),
      });
      router.push(ROLE_HOME[data.user.role] || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await doLogin(email, password);
    setLoading(false);
  }

  async function quickLogin(role: string, e: string, p: string) {
    setQuickLoading(role);
    await doLogin(e, p);
    setQuickLoading(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-lg text-primary-dark justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope size={17} className="text-white" />
          </div>
          Medicare Hospital
        </Link>

        {/* Quick login panel */}
        <div className="mb-4">
          <p className="text-xs text-muted text-center uppercase tracking-wide mb-3">Quick demo login</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LOGINS.map((q) => (
              <button
                key={q.role}
                onClick={() => quickLogin(q.role, q.email, q.password)}
                disabled={quickLoading !== null || loading}
                className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border bg-surface text-sm font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${q.color}`}
              >
                {quickLoading === q.role ? (
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${q.dot}`} />
                )}
                {q.role}
                {quickLoading === q.role && (
                  <span className="ml-auto text-xs opacity-60">signing in…</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted">or sign in manually</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Manual login form */}
        <Card className="p-6">
          <h1 className="font-display text-xl text-foreground mb-1">Log in</h1>
          <p className="text-sm text-muted mb-6">Patients, doctors, and staff all sign in here.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || quickLoading !== null}>
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted mt-6">
          New patient?{" "}
          <Link href="/register" className="text-primary font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
