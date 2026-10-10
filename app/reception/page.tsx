"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, Button, Input, Select, Textarea, StatusPill, TokenBadge } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import {
  Search,
  UserPlus,
  CalendarPlus,
  Activity,
  DollarSign,
  Printer,
  Clock,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  Filter,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { RecordVitalsModal } from "@/components/record-vitals-modal";
import { ConsultationReceiptModal, type ConsultationBillData } from "@/components/consultation-receipt-modal";
import { CollectPaymentModal } from "@/components/collect-payment-modal";

interface Appointment {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  doctorName?: string;
  departmentName?: string;
  startTime: string;
  status: string;
  type: string;
  reasonForVisit?: string;
}

interface Patient {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  patientCode?: string;
}

interface Department {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
}

interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(dateStr: string) {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

type Tab = "queue" | "walkin" | "book";

export default function ReceptionPage() {
  const [tab, setTab] = useState<Tab>("queue");
  const [date, setDate] = useState(todayISO());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [vitalsAppt, setVitalsAppt] = useState<{ id: string; patientName: string } | null>(null);
  const [payAppt, setPayAppt] = useState<{ id: string; patientName: string; tokenNumber: number } | null>(null);
  const [receiptBill, setReceiptBill] = useState<ConsultationBillData | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<{ appointments: Appointment[] }>(`/api/appointments?date=${date}`)
      .then((d) => setAppointments(d.appointments || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    let ignore = false;
    apiFetch<{ appointments: Appointment[] }>(`/api/appointments?date=${date}`)
      .then((d) => {
        if (!ignore) setAppointments(d.appointments || []);
      })
      .catch(() => {
        if (!ignore) setAppointments([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [date]);

  async function checkIn(id: string) {
    setBusyId(id);
    try {
      await apiFetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CHECKED_IN" }),
      });
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function openReceipt(appointmentId: string) {
    try {
      const res = await apiFetch<{ bill: ConsultationBillData }>(`/api/billing/appointments/${appointmentId}`);
      setReceiptBill(res.bill);
    } catch {
      // Ignore if not billed yet
    }
  }

  // Statistics derived directly from live queue
  const totalBookings = appointments.length;
  const waitingCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const checkedInCount = appointments.filter((a) => a.status === "CHECKED_IN").length;
  const inConsultCount = appointments.filter((a) => a.status === "IN_CONSULTATION").length;

  // Filtered queue
  const filteredQueue = useMemo(() => {
    return appointments.filter((a) => {
      const matchesDoc = !filterDoctor || a.doctorName === filterDoctor;
      const matchesStatus = filterStatus === "ALL" || a.status === filterStatus;
      const matchesSearch =
        !searchQuery ||
        (a.patientName && a.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(a.tokenNumber).includes(searchQuery) ||
        (a.doctorName && a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDoc && matchesStatus && matchesSearch;
    });
  }, [appointments, filterDoctor, filterStatus, searchQuery]);

  const uniqueDoctors = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((a) => {
      if (a.doctorName) set.add(a.doctorName);
    });
    return Array.from(set);
  }, [appointments]);

  return (
    <div className="space-y-8">
      {/* Front Desk Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            <span className="text-primary font-bold">Medicare Hospital</span>
            <span>&middot;</span>
            <span>Front Desk</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
            Reception &amp; patient flow
          </h1>
          <p className="text-sm text-muted mt-1 flex items-center gap-2">
            <span className="font-medium text-foreground">{formatDisplayDate(date)}</span>
            <span>&middot;</span>
            <span>Irinjalakuda Outpatient Counter</span>
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto bg-surface border border-border rounded-xl p-1.5 shadow-2xs">
          <Clock size={15} className="text-muted ml-2" />
          <span className="text-xs font-medium text-muted">Clinic Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg bg-surface-cream px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border-0"
          />
        </div>
      </div>

      {/* Metrics Row (Derived strictly from live queue) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Today&apos;s Bookings</p>
            <p className="font-editorial text-3xl text-foreground font-normal leading-none">
              {loading ? "—" : totalBookings}
            </p>
            <p className="text-[11px] text-muted mt-1.5">Total registered</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Awaiting Arrival</p>
            <p className="font-editorial text-3xl text-terracotta font-normal leading-none">
              {loading ? "—" : waitingCount}
            </p>
            <p className="text-[11px] text-muted mt-1.5">Unconfirmed arrival</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-cream text-terracotta flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Checked In</p>
            <p className="font-editorial text-3xl text-primary font-normal leading-none">
              {loading ? "—" : checkedInCount}
            </p>
            <p className="text-[11px] text-muted mt-1.5">In waiting lobby</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
            <UserCheck size={18} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">In Chamber</p>
            <p className="font-editorial text-3xl text-emerald-700 font-normal leading-none">
              {loading ? "—" : inConsultCount}
            </p>
            <p className="text-[11px] text-muted mt-1.5">Consultation active</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Activity size={18} />
          </div>
        </div>
      </div>

      {/* Reception Action Tabs */}
      <div className="flex gap-2 border-b border-border pb-px">
        {[
          { id: "queue" as Tab, label: "Today's queue", icon: <Users size={15} /> },
          { id: "walkin" as Tab, label: "Register walk-in", icon: <UserPlus size={15} /> },
          { id: "book" as Tab, label: "Book appointment", icon: <CalendarPlus size={15} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium border-b-2 -mb-px transition-all cursor-pointer ${
              tab === t.id
                ? "border-primary text-primary font-semibold bg-surface-cream/50 rounded-t-xl"
                : "border-transparent text-muted hover:text-foreground hover:bg-surface-cream/20"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Today's Queue (Dominant 2-Column Operational Workspace) */}
      {tab === "queue" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 8 Cols: Operational Queue List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <div>
                <h2 className="font-editorial text-2xl text-foreground font-normal">Today&apos;s queue</h2>
                <p className="text-xs text-muted">Arrival check-in, nurse vitals, and cashier routing</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={14} className="text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search patient / token..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary w-36 sm:w-44"
                  />
                </div>

                {uniqueDoctors.length > 0 && (
                  <select
                    value={filterDoctor}
                    onChange={(e) => setFilterDoctor(e.target.value)}
                    className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="">All doctors</option>
                    {uniqueDoctors.map((doc) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                )}

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="ALL">All statuses</option>
                  <option value="CONFIRMED">Awaiting arrival</option>
                  <option value="CHECKED_IN">Checked in</option>
                  <option value="IN_CONSULTATION">In consultation</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Queue Items or Purposeful Empty State */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface border border-border rounded-2xl p-4 animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-border/60" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-border/60" />
                      <div className="h-3 w-48 rounded bg-border/40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-surface border border-dashed border-border rounded-3xl p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface-cream border border-border/80 text-primary flex items-center justify-center mx-auto mb-4 shadow-2xs">
                  <Users size={28} />
                </div>
                <h3 className="font-editorial text-xl text-foreground font-normal mb-1">No patients in the queue</h3>
                <p className="text-sm text-muted max-w-md mx-auto mb-6 leading-relaxed">
                  New online bookings and walk-ins will appear here for {formatDisplayDate(date)}. Use the actions below to register incoming patients immediately.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setTab("walkin")}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors cursor-pointer"
                  >
                    Register walk-in
                  </button>
                  <button
                    onClick={() => setTab("book")}
                    className="px-4 py-2 rounded-xl bg-surface border border-border text-foreground text-xs font-medium hover:bg-surface-cream transition-colors cursor-pointer"
                  >
                    Book appointment
                  </button>
                </div>
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-8 text-center text-muted text-sm">
                No patients match your filter criteria.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQueue.map((a) => (
                  <div
                    key={a.id}
                    className="bg-surface border border-border rounded-2xl p-4 sm:p-5 hover:border-primary/40 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <TokenBadge number={a.tokenNumber} size="sm" />
                        <span className="text-[10px] text-muted font-medium mt-1 uppercase">Token</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-bold text-base text-foreground">
                            {a.patientName || "Patient"}
                          </p>
                          <StatusPill status={a.status} />
                          {a.type === "WALK_IN" && (
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-surface-cream border border-border text-muted">
                              Walk-in
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted mt-1">
                          {a.doctorName} &middot; {a.departmentName || "General"} &middot; <span className="font-medium text-foreground">{a.startTime}</span>
                          {a.patientPhone && ` · ${a.patientPhone}`}
                        </p>
                      </div>
                    </div>

                    {/* Quick Operational Desk Actions */}
                    <div className="flex items-center gap-2 flex-wrap justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                      {a.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          disabled={busyId === a.id}
                          onClick={() => checkIn(a.id)}
                          className="bg-primary hover:bg-primary-dark text-white text-xs font-medium"
                        >
                          Check in
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex items-center gap-1.5 text-xs text-primary border border-primary/20 hover:bg-primary-tint/50"
                        onClick={() => setVitalsAppt({ id: a.id, patientName: a.patientName || "Patient" })}
                      >
                        <Activity size={13} />
                        Vitals
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex items-center gap-1.5 text-xs text-emerald-700 border border-emerald-500/20 hover:bg-emerald-50"
                        onClick={() => setPayAppt({ id: a.id, patientName: a.patientName || "Patient", tokenNumber: a.tokenNumber })}
                      >
                        <DollarSign size={13} />
                        Collect Fee
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground border border-border"
                        onClick={() => openReceipt(a.id)}
                      >
                        <Printer size={13} />
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right 4 Cols: Front-Desk Shortcuts & Operational Panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Front Desk Shortcuts Card */}
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-2xs">
              <h3 className="font-display font-semibold text-sm text-foreground mb-1">Front-Desk Shortcuts</h3>
              <p className="text-xs text-muted mb-4">Fast actions to keep patient lines moving without delays.</p>

              <div className="space-y-3">
                <button
                  onClick={() => setTab("walkin")}
                  className="w-full text-left p-3.5 rounded-xl bg-surface-cream/70 hover:bg-surface-cream border border-border/80 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-tint text-primary flex items-center justify-center">
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Register walk-in</p>
                      <p className="text-[11px] text-muted">Generate MRN &amp; patient card</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setTab("book")}
                  className="w-full text-left p-3.5 rounded-xl bg-surface-cream/70 hover:bg-surface-cream border border-border/80 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-cream text-terracotta flex items-center justify-center">
                      <CalendarPlus size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground group-hover:text-terracotta transition-colors">Book appointment</p>
                      <p className="text-[11px] text-muted">Assign doctor slot &amp; token</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
                </button>

                <Link
                  href="/display"
                  target="_blank"
                  className="w-full text-left p-3.5 rounded-xl bg-surface-cream/70 hover:bg-surface-cream border border-border/80 transition-all cursor-pointer flex items-center justify-between group block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground group-hover:text-emerald-700 transition-colors">Open OPD TV Display</p>
                      <p className="text-[11px] text-muted">Full-screen lobby token board</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Standard Front-Desk Flow Note */}
            <div className="rounded-2xl border border-border/80 bg-surface-cream/50 p-4 text-xs text-muted space-y-2">
              <p className="font-semibold text-foreground text-xs">Receptionist Workflow</p>
              <div className="space-y-1.5 text-[11px] leading-relaxed">
                <p>1. <strong>Confirm arrival:</strong> Click &ldquo;Check in&rdquo; when patient reaches the desk.</p>
                <p>2. <strong>Record vitals:</strong> Triage BP, SpO2, and weight before consultation.</p>
                <p>3. <strong>Cashier fee:</strong> Collect consultation fees and print itemized receipts.</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab: Register Walk-In */}
      {tab === "walkin" && (
        <WalkinTab onRegistered={() => setTab("book")} />
      )}

      {/* Tab: Book Appointment */}
      {tab === "book" && (
        <BookTab onBooked={() => { setTab("queue"); load(); }} />
      )}

      {/* Modals */}
      {vitalsAppt && (
        <RecordVitalsModal
          appointmentId={vitalsAppt.id}
          patientName={vitalsAppt.patientName}
          onClose={() => setVitalsAppt(null)}
          onSaved={() => {
            setVitalsAppt(null);
            load();
          }}
        />
      )}

      {payAppt && (
        <CollectPaymentModal
          appointmentId={payAppt.id}
          patientName={payAppt.patientName}
          tokenNumber={payAppt.tokenNumber}
          onClose={() => setPayAppt(null)}
          onSuccess={(bill) => {
            setPayAppt(null);
            setReceiptBill(bill);
            load();
          }}
        />
      )}

      {receiptBill && (
        <ConsultationReceiptModal
          bill={receiptBill}
          onClose={() => setReceiptBill(null)}
        />
      )}
    </div>
  );
}

function WalkinTab({ onRegistered }: { onRegistered: () => void }) {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", gender: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await apiFetch<{ patient: { fullName: string; patientCode: string } }>(
        "/api/reception/walkin",
        { method: "POST", body: JSON.stringify(form) }
      );
      setMessage(`Registered ${data.patient.fullName} — MRN: ${data.patient.patientCode}`);
      setForm({ fullName: "", phone: "", email: "", gender: "", address: "" });
      onRegistered();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not register patient.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-2xs">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/80">
        <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center">
          <UserPlus size={20} />
        </div>
        <div>
          <h2 className="font-editorial text-2xl text-foreground font-normal">Register walk-in patient</h2>
          <p className="text-xs text-muted">Generate immediate Electronic Health Record and MRN code</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          <Input label="Phone number" required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Email address (optional)" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          <Select label="Gender" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>

        <Textarea label="Residential address" rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} />
        
        {message && (
          <p className="text-sm font-medium text-primary bg-primary-tint/60 p-3 rounded-xl border border-primary/20">
            {message}
          </p>
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white justify-center" disabled={loading}>
            {loading ? "Registering…" : "Complete Registration & Assign Slot →"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function BookTab({ onBooked }: { onBooked?: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ departments: Department[] }>("/api/departments").then((d) => setDepartments(d.departments || []));
  }, []);

  useEffect(() => {
    const url = departmentId ? `/api/doctors?departmentId=${departmentId}` : "/api/doctors";
    apiFetch<{ doctors: Doctor[] }>(url).then((d) => setDoctors(d.doctors || []));
  }, [departmentId]);

  useEffect(() => {
    if (!doctorId || !date) return;
    let ignore = false;
    apiFetch<{ slots: Slot[] }>(`/api/doctors/${doctorId}/slots?date=${date}`).then((d) => {
      if (!ignore) setSlots(d.slots || []);
    });
    return () => {
      ignore = true;
    };
  }, [doctorId, date]);

  async function search(q: string) {
    setQuery(q);
    if (q.trim().length < 2) return setResults([]);
    const data = await apiFetch<{ patients: Patient[] }>(`/api/patients/search?q=${encodeURIComponent(q)}`);
    setResults(data.patients || []);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setMessage("");
    try {
      await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId,
          patientId: selected.id,
          date,
          startTime,
          type: "WALK_IN",
          reasonForVisit: reason,
        }),
      });
      setMessage("Appointment booked successfully.");
      setSelected(null);
      setQuery("");
      setReason("");
      setStartTime("");
      if (onBooked) onBooked();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not book appointment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
      {/* Patient Search */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-2.5 mb-4">
          <Search size={18} className="text-primary" />
          <h2 className="font-editorial text-xl text-foreground font-normal">1. Select Patient</h2>
        </div>
        <Input
          placeholder="Search by name, phone, or MRN code..."
          value={query}
          onChange={(e) => search(e.target.value)}
        />
        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelected(p);
                setResults([]);
                setQuery(p.fullName);
              }}
              className="w-full text-left rounded-xl border border-border p-3 hover:border-primary transition-colors cursor-pointer bg-surface hover:bg-surface-cream/50"
            >
              <p className="text-sm font-semibold text-foreground">{p.fullName}</p>
              <p className="text-xs text-muted">{p.phone} &middot; MRN: {p.patientCode || "N/A"}</p>
            </button>
          ))}
        </div>
        {selected && (
          <div className="mt-4 rounded-xl bg-primary-tint/70 p-3.5 text-xs text-primary-dark border border-primary/20">
            Selected: <strong className="font-semibold text-sm">{selected.fullName}</strong> ({selected.phone})
          </div>
        )}
      </div>

      {/* Appointment Details */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-2.5 mb-4">
          <CalendarPlus size={18} className="text-primary" />
          <h2 className="font-editorial text-xl text-foreground font-normal">2. Consultation Details</h2>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Select label="Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>

          <Select
            label="Doctor"
            required
            value={doctorId}
            onChange={(e) => {
              setDoctorId(e.target.value);
              setStartTime("");
            }}
          >
            <option value="">Select Doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.fullName} — {d.specialization}</option>
            ))}
          </Select>

          <label className="block">
            <span className="block text-sm font-medium text-foreground mb-1.5">Date</span>
            <input
              type="date"
              min={todayISO()}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setStartTime("");
              }}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm focus:border-primary outline-none"
            />
          </label>

          {doctorId && (
            <div>
              <span className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Available Slots</span>
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                {slots.map((s) => (
                  <button
                    type="button"
                    key={s.startTime}
                    disabled={!s.available}
                    onClick={() => setStartTime(s.startTime)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      startTime === s.startTime
                        ? "bg-primary text-white border-primary"
                        : s.available
                        ? "border-border hover:border-primary bg-surface"
                        : "border-border text-muted/50 line-through cursor-not-allowed bg-surface-cream/50"
                    }`}
                  >
                    {s.startTime}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Textarea label="Reason for visit" required rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          
          {message && <p className="text-sm text-primary">{message}</p>}

          <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white justify-center" disabled={!selected || !startTime || loading}>
            {loading ? "Booking…" : "Confirm Appointment & Issue Token"}
          </Button>
        </form>
      </div>
    </div>
  );
}
