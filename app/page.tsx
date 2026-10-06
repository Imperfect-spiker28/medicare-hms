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
    <div className="flex-1">
      {/* Top bar */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-semibold text-lg text-primary-dark">
            <Stethoscope size={22} />
            Medicare Hospital
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/display"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-teal-200 text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live OPD TV Screen
            </Link>
            {homeHref ? (
              <Link href={homeHref}>
                <Button size="sm">Go to dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary">
                  Log in
                </Link>
                <Link href="/register">
                  <Button size="sm">Book an appointment</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <p className="text-sm font-medium text-accent-dark tracking-wide uppercase mb-4">
            Irinjalakuda, Thrissur, Kerala
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-foreground mb-5">
            Your appointment, your token, your care — sorted before you leave home.
          </h1>
          <p className="text-muted text-lg mb-8 max-w-lg">
            Medicare Hospital&apos;s patient portal lets you book with the right
            department, see your token number in advance, and pick up prescriptions
            and lab reports online — no more waiting in line to ask.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button>
                Book an appointment <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">I already have an account</Button>
            </Link>
          </div>
        </div>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-wide text-muted mb-4">Today at Medicare</p>
          <div className="flex items-center gap-4 mb-5">
            <TokenBadge number={14} size="lg" />
            <div>
              <p className="font-display text-lg text-foreground">Dr. Priya Varma</p>
              <p className="text-sm text-muted">Cardiology &middot; 10:30 AM slot</p>
              <p className="text-sm text-success mt-1">Confirmed</p>
            </div>
          </div>
          <div className="border-t border-border pt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-display text-xl text-primary-dark">{doctors.length}</p>
              <p className="text-xs text-muted">Doctors</p>
            </div>
            <div>
              <p className="font-display text-xl text-primary-dark">{departments.length}</p>
              <p className="text-xs text-muted">Departments</p>
            </div>
            <div>
              <p className="font-display text-xl text-primary-dark">15 min</p>
              <p className="text-xs text-muted">Avg. slot</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Departments */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="font-display text-2xl text-foreground mb-6">Departments</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {departments.map((d) => (
            <Card key={d.id} className="p-5">
              <p className="font-display text-lg text-foreground mb-1">{d.name}</p>
              <p className="text-sm text-muted">{d.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Doctors preview */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="font-display text-2xl text-foreground mb-6">Meet some of our doctors</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {previewDoctors.map((d) => (
            <Card key={d.id} className="p-5">
              <p className="font-display text-lg text-foreground">{d.fullName}</p>
              <p className="text-sm text-accent-dark mb-1">{d.specialization}</p>
              <p className="text-sm text-muted">{d.department?.name || "General Medicine"} &middot; {d.yearsExperience} yrs experience</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-primary-tint py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-2xl text-foreground mb-10">
            Everything the front desk used to handle for you
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <Feature icon={<CalendarCheck size={22} />} title="Book & reschedule" text="Pick a department, doctor, and slot — reschedule anytime before your visit." />
            <Feature icon={<ClipboardList size={22} />} title="Digital prescriptions" text="Your doctor's notes and prescriptions land in your account right after your visit." />
            <Feature icon={<FlaskConical size={22} />} title="Lab reports" text="Download reports as soon as the lab uploads them — no return trip needed." />
            <Feature icon={<Pill size={22} />} title="Family accounts" text="Manage appointments and records for the people you care for, in one place." />
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between text-sm text-muted">
        <span className="flex items-center gap-2">
          <ShieldCheck size={16} /> Medicare Hospital, Irinjalakuda — patient data handled securely.
        </span>
        <span>&copy; {new Date().getFullYear()} Medicare Hospital</span>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div>
      <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <p className="font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}
