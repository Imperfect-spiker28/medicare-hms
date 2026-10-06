"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Button, Card, Input, Select } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push("/patient");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-lg text-primary-dark justify-center mb-8">
          <Stethoscope size={22} /> Medicare Hospital
        </Link>
        <Card className="p-6">
          <h1 className="font-display text-xl text-foreground mb-1">Create your account</h1>
          <p className="text-sm text-muted mb-6">
            Get a digital health card and start booking appointments.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Full name"
              required
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <Input
              label="Phone number"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Gender"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
              >
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
              <Input
                label="Date of birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
              />
            </div>
            <Input
              label="Password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Card>
        <p className="text-center text-sm text-muted mt-6">
          Already registered?{" "}
          <Link href="/login" className="text-primary font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
