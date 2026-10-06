import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Button, Card, TokenBadge } from "@/components/ui";
import {
  Stethoscope,
  CalendarCheck,
  ClipboardList,
  FlaskConical,
  Pill,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  HeartPulse,
  Tv,
} from "lucide-react";

const ROLE_HOME: Record<string, string> = {
  PATIENT: "/patient",
  DOCTOR: "/doctor",
  RECEPTIONIST: "/reception",
  ADMIN: "/admin",
};

const API_BASE = process.env.API_BASE_URL || "http://127.0.0.1:8080";

async function getHomeData() {
  try {
    const [deptRes, docRes] = await Promise.all([
      fetch(`${API_BASE}/api/departments`, { next: { revalidate: 60 } }),
      fetch(`${API_BASE}/api/doctors`, { next: { revalidate: 60 } }),
    ]);
    const deptData = deptRes.ok ? await deptRes.json() : { departments: [] };
    const docData = docRes.ok ? await docRes.json() : { doctors: [] };
    return {
      departments: (deptData.departments || []) as Array<{ id: string; name: string; description: string }>,
      doctors: (docData.doctors || []) as Array<{ id: string; fullName: string; specialization: string; department?: { name: string } | null; yearsExperience: number }>,
    };
  } catch {
    return {
      departments: [
        { id: "1", name: "General Medicine", description: "Primary care and general consultations" },
        { id: "2", name: "Cardiology", description: "Heart and cardiovascular care" },
        { id: "3", name: "Pediatrics", description: "Child healthcare" },
        { id: "4", name: "Orthopedics", description: "Bone, joint, and muscle care" },
        { id: "5", name: "Gynecology", description: "Women's health" },
        { id: "6", name: "ENT", description: "Ear, nose, and throat care" },
      ],
      doctors: [
        { id: "1", fullName: "Dr. Suresh Nair", specialization: "General Physician", department: { name: "General Medicine" }, yearsExperience: 14 },
        { id: "2", fullName: "Dr. Priya Varma", specialization: "Cardiologist", department: { name: "Cardiology" }, yearsExperience: 11 },
        { id: "3", fullName: "Dr. Arun Thomas", specialization: "Pediatrician", department: { name: "Pediatrics" }, yearsExperience: 9 },
      ],
    };
  }
}

export default async function HomePage() {
  const session = await getSession();
  const homeHref = session ? ROLE_HOME[session.role] : null;
  const { departments, doctors } = await getHomeData();
  const previewDoctors = doctors.slice(0, 3);

  return (
    <div className="flex-1 bg-background text-foreground selection:bg-primary/20">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-display font-semibold text-lg text-primary-dark">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
              <Stethoscope size={18} />
            </div>
            <span>Medicare Hospital</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/display"
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-200 text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Tv size={13} className="text-teal-700" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live OPD TV
            </Link>

            {homeHref ? (
              <Link href={homeHref}>
                <Button size="sm" className="shadow-xs">Dashboard <ArrowRight size={14} /></Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary px-2 py-1">
                  Log in
                </Link>
                <Link href="/register">
                  <Button size="sm">Book appointment</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-border/60 bg-gradient-to-b from-primary-tint/40 via-surface to-background">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-tint border border-accent/20 text-accent-dark text-xs font-medium uppercase tracking-wider mb-5">
              <Sparkles size={13} /> Irinjalakuda, Thrissur, Kerala
            </div>

            <h1 className="font-display text-4xl sm:text-5xl leading-[1.15] text-foreground mb-5 font-normal tracking-tight">
              Your appointment, your token, your care —{" "}
              <span className="text-primary-dark font-medium underline decoration-accent/40 decoration-wavy">sorted before you leave.</span>
            </h1>

            <p className="text-muted text-base sm:text-lg mb-8 max-w-xl leading-relaxed">
              No long queues or crowded waiting halls. Book your preferred specialist, track real-time OPD token numbers, and access verified prescriptions and diagnostic lab reports directly from your phone.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link href="/register">
                <Button size="md" className="shadow-md shadow-primary/20">
                  Book an appointment <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="md">Quick sign in</Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border/80 text-xs text-muted">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <HeartPulse size={15} className="text-primary" /> NABH Certified Care
              </div>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Clock size={15} className="text-primary" /> Zero Front-desk Waiting
              </div>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck size={15} className="text-primary" /> 100% Digital Health Card
              </div>
            </div>
          </div>

          {/* Interactive Live OPD Hero Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur-lg opacity-20"></div>
            <Card className="relative p-6 sm:p-7 shadow-xl border-border bg-surface">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-primary">Live OPD Simulation</p>
                  <p className="text-xs text-muted">Real-time status at Clinic Chamber 2</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Consulting Now
                </span>
              </div>

              <div className="flex items-center gap-5 mb-6 bg-primary-tint/40 p-4 rounded-xl border border-primary/10">
                <TokenBadge number={14} size="lg" />
                <div className="min-w-0">
                  <p className="font-display text-xl font-semibold text-foreground">Dr. Priya Varma</p>
                  <p className="text-xs font-medium text-accent-dark">Senior Consultant &middot; Cardiology</p>
                  <p className="text-xs text-muted mt-1 flex items-center gap-1">
                    <Clock size={12} /> Today, 10:30 AM Slot (Room 204)
                  </p>
                </div>
              </div>

              {/* Hospital Key Figures */}
              <div className="grid grid-cols-3 gap-3 text-center border-t border-border pt-4">
                <div className="p-2 rounded-lg bg-background">
                  <p className="font-display text-2xl font-bold text-primary-dark">{doctors.length}</p>
                  <p className="text-[11px] text-muted">Specialists</p>
                </div>
                <div className="p-2 rounded-lg bg-background">
                  <p className="font-display text-2xl font-bold text-primary-dark">{departments.length}</p>
                  <p className="text-[11px] text-muted">Departments</p>
                </div>
                <div className="p-2 rounded-lg bg-background">
                  <p className="font-display text-2xl font-bold text-accent-dark">15m</p>
                  <p className="text-[11px] text-muted">Avg. OPD Slot</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Hospital Departments */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Clinical Specialities</p>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">Our Medical Departments</h2>
          </div>
          <Link href="/register" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1">
            View all services <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {departments.map((d) => (
            <Card key={d.id} className="p-5 hover:border-primary/50 hover:shadow-md transition-all group cursor-default">
              <div className="w-8 h-8 rounded-lg bg-primary-tint text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                <HeartPulse size={16} />
              </div>
              <p className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{d.name}</p>
              <p className="text-xs text-muted leading-relaxed">{d.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Doctors Preview */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="mb-8">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Expert Physicians</p>
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">Consult With Senior Doctors</h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {previewDoctors.map((d) => (
            <Card key={d.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-primary-tint text-primary-dark font-display font-bold flex items-center justify-center text-sm border border-primary/20">
                  {d.fullName.replace("Dr. ", "").split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-display font-semibold text-base text-foreground">{d.fullName}</p>
                  <p className="text-xs font-medium text-accent-dark">{d.specialization}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border/70">
                <span>{d.department?.name || "General Medicine"}</span>
                <span className="font-medium text-foreground">{d.yearsExperience} yrs exp.</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Portal Features */}
      <section className="bg-primary-tint/50 border-y border-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Seamless Experience</p>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-3">
              Everything Handled Ahead Of Time
            </h2>
            <p className="text-sm text-muted">Experience modern hospital visits without manual paper forms, billing queues, or physical report collections.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Feature
              icon={<CalendarCheck size={20} />}
              title="Slot & Token Booking"
              text="Select doctor, available slot, and walk into your consultation exactly when your token is called."
            />
            <Feature
              icon={<ClipboardList size={20} />}
              title="Digital Prescriptions"
              text="Doctor diagnoses, medication doses, and frequency schedules stored safely in your health card."
            />
            <Feature
              icon={<FlaskConical size={20} />}
              title="Instant Lab Reports"
              text="Standardized pathology & radiology results verified by technicians available with single-click print."
            />
            <Feature
              icon={<Pill size={20} />}
              title="Cashier & Billing"
              text="Transparent itemized OPD receipts with GST exemptions and multiple online/counter payment methods."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <span className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" /> Medicare Hospital, Irinjalakuda — Patient health records encrypted and protected.
        </span>
        <span>&copy; {new Date().getFullYear()} Medicare Hospital. All rights reserved.</span>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-xs">
      <div className="w-9 h-9 rounded-lg bg-primary-tint border border-primary/20 flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <p className="font-display font-semibold text-sm text-foreground mb-1.5">{title}</p>
      <p className="text-xs text-muted leading-relaxed">{text}</p>
    </div>
  );
}
