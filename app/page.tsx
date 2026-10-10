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
  CheckCircle2,
  Activity,
  Award,
  Building2,
  Calendar,
  UserCheck,
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
        { id: "1", name: "General Medicine", description: "Comprehensive acute & chronic primary health consultations, preventative checkups, and triage." },
        { id: "2", name: "Cardiology", description: "Advanced ECG interpretation, clinical cardiovascular diagnostics, and hypertension management." },
        { id: "3", name: "Pediatrics", description: "Dedicated pediatric wellness, vaccination schedules, and compassionate child medicine." },
        { id: "4", name: "Orthopedics", description: "Musculoskeletal trauma, joint assessment, mobility therapy, and post-operative care." },
        { id: "5", name: "Gynecology & Obstetrics", description: "Maternal care, prenatal monitoring, wellness clinics, and specialized women's health." },
        { id: "6", name: "ENT & Otolaryngology", description: "Clinical diagnosis and treatment for auditory, nasal, sinus, and throat conditions." },
      ],
      doctors: [
        { id: "1", fullName: "Dr. Suresh Nair", specialization: "Senior General Physician", department: { name: "General Medicine" }, yearsExperience: 14 },
        { id: "2", fullName: "Dr. Priya Varma", specialization: "Consultant Cardiologist", department: { name: "Cardiology" }, yearsExperience: 11 },
        { id: "3", fullName: "Dr. Arun Thomas", specialization: "Pediatric Specialist", department: { name: "Pediatrics" }, yearsExperience: 9 },
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
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-display font-semibold text-lg text-primary-dark">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
              <Stethoscope size={18} />
            </div>
            <span>Medicare Hospital</span>
          </Link>

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
                  <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">Book appointment</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section: Editorial & Warm Split */}
      <section className="relative overflow-hidden pt-14 pb-20 border-b border-border/70 bg-gradient-to-b from-surface-cream/70 via-background to-background">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-cream border border-border text-foreground/80 text-xs font-medium uppercase tracking-wider mb-6">
              <Sparkles size={13} className="text-terracotta" /> Irinjalakuda, Thrissur &middot; Modern Outpatient Care
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-foreground font-normal tracking-tight leading-[1.1] mb-6">
              Care scheduled with clarity,{" "}
              <span className="italic font-normal text-primary">honored with precision.</span>
            </h1>

            <p className="text-muted text-base sm:text-lg mb-8 max-w-xl leading-relaxed font-normal">
              Book consultations online, monitor your live token queue in real time, and receive digital prescriptions and lab investigations directly to your verified portal.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <Link href="/register">
                <Button size="md" className="bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20">
                  Book an appointment <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="md" className="border-border bg-surface hover:bg-surface-cream text-foreground">
                  Access patient records
                </Button>
              </Link>
            </div>

            {/* Verifiable Operational Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/80 text-xs text-muted">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 size={16} className="text-primary shrink-0" />
                <span>Zero paper registration</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Clock size={16} className="text-primary shrink-0" />
                <span>15-min scheduled slots</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-foreground">
                <ShieldCheck size={16} className="text-primary shrink-0" />
                <span>Encrypted health records</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Chamber Schedule Demonstration */}
          <div className="lg:col-span-5">
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-xl shadow-foreground/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-primary via-terracotta to-accent" />
              
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/70">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Interactive Demo Preview</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">Live Chamber Consultation Display</p>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-surface-cream border border-border text-foreground/70">
                  Simulated Stream
                </span>
              </div>

              {/* Consultation Card */}
              <div className="bg-surface-cream/80 border border-border/80 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3.5">
                  <TokenBadge number={14} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display font-bold text-foreground text-base">Dr. Priya Varma</p>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                        In Chamber
                      </span>
                    </div>
                    <p className="text-xs font-medium text-terracotta mt-0.5">Senior Consultant &middot; Cardiology</p>
                    <div className="flex items-center gap-2 text-xs text-muted mt-2">
                      <Clock size={12} className="text-primary" />
                      <span>Current Slot: 10:30 AM &middot; Room 204</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Metrics */}
              <div className="grid grid-cols-3 gap-2.5 text-center pt-2">
                <div className="p-3 rounded-lg bg-surface-cream/50 border border-border/60">
                  <p className="font-editorial text-2xl font-bold text-primary">{doctors.length}</p>
                  <p className="text-[11px] text-muted font-medium mt-0.5">Specialists</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-cream/50 border border-border/60">
                  <p className="font-editorial text-2xl font-bold text-primary">{departments.length}</p>
                  <p className="text-[11px] text-muted font-medium mt-0.5">Departments</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-cream/50 border border-border/60">
                  <p className="font-editorial text-2xl font-bold text-terracotta">15m</p>
                  <p className="text-[11px] text-muted font-medium mt-0.5">Slot Pace</p>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-border/70 flex items-center justify-between text-[11px] text-muted">
                <span>Next token called automatically</span>
                <Link href="/display" className="text-primary font-medium hover:underline flex items-center gap-1">
                  Open TV display <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Editorial Department Catalog (Broken from uniform 6-card grid) */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-terracotta uppercase tracking-wider mb-2">Clinical Departments</p>
          <h2 className="font-editorial text-3xl sm:text-4xl text-foreground font-normal">
            Specialized care, unified under one clinical system
          </h2>
          <p className="text-muted text-sm mt-3 leading-relaxed">
            Every clinical specialty operates on standardized digital token queues, instant prescription generation, and electronic laboratory integration.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Featured Primary Care Spotlight */}
          <div className="md:col-span-5 bg-gradient-to-br from-primary-tint/60 via-surface-cream to-surface border border-primary/20 rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-6 shadow-xs">
                <HeartPulse size={20} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Core Clinical Service</span>
              <h3 className="font-editorial text-2xl text-foreground font-normal mt-2 mb-3">General Medicine & Outpatient Triage</h3>
              <p className="text-muted text-sm leading-relaxed mb-6">
                Our walk-in and booked OPD triage provides primary diagnostics, chronic ailment follow-ups, preventive screenings, and onward specialist referrals.
              </p>
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted">Monday – Saturday &middot; 8:00 AM – 7:00 PM</span>
              <Link href="/register" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Book General OPD <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Specialty Grid */}
          <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
            {departments.slice(1).map((d, index) => (
              <div
                key={d.id}
                className="bg-surface border border-border/80 hover:border-primary/50 transition-all rounded-xl p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-editorial text-xs font-semibold text-terracotta">0{index + 2}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted bg-surface-cream border border-border/60 px-2 py-0.5 rounded">
                      Specialty
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors mb-2">
                    {d.name}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    {d.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted">
                  <span>Slot-based OPD</span>
                  <Link href="/register" className="text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                    Schedule <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section: Refined Portrait Avatars */}
      <section className="border-t border-border/70 bg-surface-cream/40 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold text-terracotta uppercase tracking-wider mb-2">Medical Faculty</p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-foreground font-normal">
                Consult with Senior Practitioners
              </h2>
            </div>
            <Link href="/register" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto">
              View all doctor schedules <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {previewDoctors.map((d) => (
              <div key={d.id} className="bg-surface border border-border rounded-2xl p-6 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
                <div>
                  {/* Refined Doctor Portrait Placeholder */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-tint via-surface-cream to-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-xs">
                      <Stethoscope size={24} className="text-primary" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" title="Available for appointments" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-base text-foreground truncate">{d.fullName}</h3>
                      <p className="text-xs font-medium text-terracotta truncate">{d.specialization}</p>
                      <p className="text-[11px] text-muted mt-0.5">{d.department?.name || "General Medicine"}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs py-3.5 border-y border-border/70 text-muted">
                    <div className="flex items-center justify-between">
                      <span>Clinical Experience:</span>
                      <span className="font-medium text-foreground">{d.yearsExperience} Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Consultation Format:</span>
                      <span className="font-medium text-foreground">In-Person OPD & E-Prescription</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-1">
                  <Link href="/register" className="w-full">
                    <Button variant="secondary" size="sm" className="w-full justify-center bg-surface-cream hover:bg-surface border-border text-foreground">
                      Book with {d.fullName.split(" ")[1] || "Doctor"}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Editorial Features & Flow */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold text-terracotta uppercase tracking-wider mb-2">Hospital Workflow</p>
          <h2 className="font-editorial text-3xl sm:text-4xl text-foreground font-normal mb-3">
            How your visit unfolds from home to dispensary
          </h2>
          <p className="text-sm text-muted">
            Designed to eliminate paper bottlenecks, prolonged waiting areas, and scattered diagnostic slips.
          </p>
        </div>

        {/* 4-Step Narrative Flow replacing uniform cards */}
        <div className="grid md:grid-cols-4 gap-6 relative">
          <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-editorial font-bold text-base">
                  01
                </div>
                <Calendar size={18} className="text-muted" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground mb-2">Reserved Time Slot</h3>
              <p className="text-xs text-muted leading-relaxed">
                Choose doctor and preferred time window online. Your unique OPD token number is assigned immediately.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/60 text-[11px] text-primary font-medium">
              Confirmed on patient portal
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-cream text-terracotta flex items-center justify-center font-editorial font-bold text-base">
                  02
                </div>
                <Tv size={18} className="text-muted" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground mb-2">Queue Visibility</h3>
              <p className="text-xs text-muted leading-relaxed">
                Watch chamber progress on public displays or on your phone. Walk in when your token is called without front desk delays.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/60 text-[11px] text-terracotta font-medium">
              Real-time chamber sync
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-editorial font-bold text-base">
                  03
                </div>
                <ClipboardList size={18} className="text-muted" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground mb-2">Electronic Rx</h3>
              <p className="text-xs text-muted leading-relaxed">
                Your doctor inputs clinical notes, medication regimens, and dosage instructions directly into your digital record.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/60 text-[11px] text-primary font-medium">
              Instant PDF generation
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-cream text-terracotta flex items-center justify-center font-editorial font-bold text-base">
                  04
                </div>
                <FlaskConical size={18} className="text-muted" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground mb-2">Integrated Diagnostics</h3>
              <p className="text-xs text-muted leading-relaxed">
                Lab investigations are authorized and completed in-house, with technician verification syncing to your portal.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/60 text-[11px] text-terracotta font-medium">
              Accessible anywhere
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-cream/50 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" />
            <span>Medicare Hospital, Irinjalakuda — Patient health records encrypted and protected.</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Medicare Hospital. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
