import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui";
import { HeartPulse } from "lucide-react";

const API_BASE = process.env.API_BASE_URL || "http://localhost:8080";

interface PatientRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  patientCode?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  insuranceProvider?: string;
  allergies?: string;
}

async function getProfileData(userId: string): Promise<PatientRecord | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mch_session")?.value;
    const res = await fetch(`${API_BASE}/api/patients/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}`, Cookie: `mch_session=${token}` } : {},
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.patient as PatientRecord;
  } catch {
    return null;
  }
}

export default async function PatientProfilePage() {
  const session = await getSession();
  const profile = session ? await getProfileData(session.userId) : null;

  const fullName = profile?.fullName || session?.fullName || "Patient";
  const patientCode = profile?.patientCode || "MCH-2026-000001";
  const bloodGroup = profile?.bloodGroup || "—";
  const phone = profile?.phone || "—";
  const dateOfBirth = profile?.dateOfBirth || "—";
  const email = profile?.email || "—";
  const gender = profile?.gender || "—";
  const address = profile?.address || "—";
  const emergencyContact = profile?.emergencyContactName || "—";
  const insurance = profile?.insuranceProvider || "Not on file";
  const allergies = profile?.allergies || "None recorded";

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-foreground mb-6">Health card & profile</h1>

      <Card className="p-6 mb-8 bg-primary text-white border-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <HeartPulse size={20} />
            <span className="font-display font-medium">Medicare Hospital</span>
          </div>
          <span className="text-xs uppercase tracking-wide opacity-80">Digital health card</span>
        </div>
        <p className="font-display text-2xl mb-1">{fullName}</p>
        <p className="text-sm opacity-90 mb-4">{patientCode}</p>
        <div className="grid grid-cols-3 gap-4 text-sm opacity-90">
          <div>
            <p className="opacity-70 text-xs">Blood group</p>
            <p>{bloodGroup}</p>
          </div>
          <div>
            <p className="opacity-70 text-xs">Phone</p>
            <p>{phone}</p>
          </div>
          <div>
            <p className="opacity-70 text-xs">DOB</p>
            <p>{dateOfBirth}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg text-foreground mb-4">Personal details</h2>
        <dl className="grid grid-cols-2 gap-y-4 text-sm">
          <Field label="Full name" value={fullName} />
          <Field label="Email" value={email} />
          <Field label="Phone" value={phone} />
          <Field label="Gender" value={gender} />
          <Field label="Address" value={address} />
          <Field label="Emergency contact" value={emergencyContact} />
          <Field label="Insurance provider" value={insurance} />
          <Field label="Allergies" value={allergies} />
        </dl>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted uppercase tracking-wide">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
