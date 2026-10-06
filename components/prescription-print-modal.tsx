"use client";

import { Printer, X, Stethoscope } from "lucide-react";
import { Button } from "./ui";

export interface PrescriptionData {
  hospitalName?: string;
  hospitalAddress?: string;
  doctorName: string;
  doctorSpecialization?: string;
  doctorRegNo?: string;
  doctorDepartment?: string;
  patientName: string;
  patientCode?: string;
  patientPhone?: string;
  patientGender?: string;
  patientAgeOrDob?: string;
  date: string;
  tokenNumber?: number;
  diagnosis?: string;
  clinicalNotes?: string;
  items: Array<{
    medicine: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions?: string;
  }>;
}

export function PrescriptionPrintModal({
  data,
  onClose,
}: {
  data: PrescriptionData;
  onClose: () => void;
}) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-border p-8 my-8 print:border-none print:shadow-none print:m-0 print:p-6 print:w-full">
        {/* Action Controls - hidden during print */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-border print:hidden">
          <div className="flex items-center gap-2 text-primary-dark font-display font-semibold">
            <Printer size={18} /> Official Prescription Preview
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer size={16} /> Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Letterhead */}
        <div className="printable-prescription font-sans text-gray-900">
          {/* Header */}
          <div className="border-b-2 border-primary pb-4 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-primary-dark font-display text-2xl font-bold">
                <Stethoscope size={28} className="text-primary" />
                Medicare Hospital
              </div>
              <p className="text-xs text-muted mt-0.5">
                Railway Station Road, Irinjalakuda, Thrissur, Kerala — 680121
              </p>
              <p className="text-xs text-muted">
                Ph: +91 480 282 5555 &middot; Email: opd@medicarehospital.in &middot; Reg: KL-MED-2026
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-primary-tint text-primary-dark text-xs font-semibold rounded-full uppercase tracking-wider mb-1">
                Outpatient Department
              </span>
              {data.tokenNumber && (
                <p className="text-sm font-semibold text-foreground">
                  OPD Token: <span className="text-primary-dark text-base">#{data.tokenNumber}</span>
                </p>
              )}
              <p className="text-xs text-muted">Date: {data.date}</p>
            </div>
          </div>

          {/* Doctor & Patient Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-surface p-4 rounded-xl border border-border mb-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted mb-1">Consulting Doctor</p>
              <p className="font-bold text-base text-foreground">{data.doctorName}</p>
              <p className="text-xs text-primary font-medium">{data.doctorSpecialization || "Consultant Physician"}</p>
              <p className="text-xs text-muted">Dept: {data.doctorDepartment || "General Medicine"}</p>
              {data.doctorRegNo && <p className="text-[11px] text-muted">Reg No: {data.doctorRegNo}</p>}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted mb-1">Patient Details</p>
              <p className="font-bold text-base text-foreground">{data.patientName}</p>
              <p className="text-xs text-muted font-mono font-medium">Health Card: {data.patientCode || "MCH-2026"}</p>
              <div className="flex gap-3 text-xs text-muted mt-0.5">
                {data.patientGender && <span>Gender: {data.patientGender}</span>}
                {data.patientAgeOrDob && <span>DOB: {data.patientAgeOrDob}</span>}
                {data.patientPhone && <span>Ph: {data.patientPhone}</span>}
              </div>
            </div>
          </div>

          {/* Diagnosis & Findings */}
          {(data.diagnosis || data.clinicalNotes) && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 text-sm">
              {data.diagnosis && (
                <div className="mb-2">
                  <span className="font-semibold text-gray-800 text-xs uppercase tracking-wider block">Clinical Diagnosis:</span>
                  <p className="text-gray-900 font-medium mt-0.5">{data.diagnosis}</p>
                </div>
              )}
              {data.clinicalNotes && (
                <div>
                  <span className="font-semibold text-gray-800 text-xs uppercase tracking-wider block">Clinical Advice & Notes:</span>
                  <p className="text-gray-700 text-xs mt-0.5 leading-relaxed">{data.clinicalNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Rx Symbol & Medication Table */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-serif font-black text-primary-dark">℞</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Prescribed Medications</span>
            </div>

            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-border text-xs uppercase text-muted font-semibold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Medicine & Strength</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Special Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface/50">
                    <td className="py-2.5 px-3 text-xs text-muted font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-foreground">{item.medicine}</td>
                    <td className="py-2.5 px-3 text-muted">{item.dosage}</td>
                    <td className="py-2.5 px-3 text-muted">{item.frequency}</td>
                    <td className="py-2.5 px-3 text-muted font-medium">{item.durationDays} days</td>
                    <td className="py-2.5 px-3 text-xs text-muted italic">
                      {item.instructions || "As directed by physician"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer & Doctor Signature */}
          <div className="pt-8 border-t border-border flex justify-between items-end mt-12">
            <div className="text-[11px] text-muted max-w-sm">
              <p className="font-semibold text-gray-700 mb-0.5">Note:</p>
              <p>Take medicines as prescribed. In case of adverse reactions, contact emergency care immediately.</p>
              <p className="mt-1">Generated by Medicare Hospital Management Portal.</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-gray-400 mb-1"></div>
              <p className="text-xs font-semibold text-foreground">{data.doctorName}</p>
              <p className="text-[11px] text-muted">Authorized Medical Practitioner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
