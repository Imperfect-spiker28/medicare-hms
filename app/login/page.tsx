"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";

const ROLE_HOME: Record<string, string> = {
  PATIENT: "/patient",
  DOCTOR: "/doctor",
  RECEPTIONIST: "/reception",
  ADMIN: "/admin",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch<{ user: { role: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push(ROLE_HOME[data.user.role] || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-lg text-primary-dark justify-center mb-8">
          <Stethoscope size={22} /> Medicare Hospital
        </Link>
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
            <Button type="submit" className="w-full" disabled={loading}>
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
        <details className="mt-6 text-xs text-muted">
          <summary className="cursor-pointer text-center">Demo credentials</summary>
          <div className="mt-2 bg-surface border border-border rounded-xl p-3 space-y-1">
            <p>Password for every account: <code>Password@123</code></p>
            <p>Admin: admin@medicarehospital.in</p>
            <p>Reception: reception@medicarehospital.in</p>
            <p>Doctor: doctor1@medicarehospital.in</p>
            <p>Patient: patient@example.com</p>
          </div>
        </details>
      </div>
    </div>
  );
}
