"use client";

import { Printer, X, FlaskConical, CheckCircle2 } from "lucide-react";
import { Button } from "./ui";

export interface LabReportData {
  id: string;
  orderNumber: string;
  patientName: string;
  patientCode: string;
  doctorName: string;
  testName: string;
  testCategory: string;
  sampleType: string;
  status: string;
  clinicalNotes?: string;
  resultValue?: string;
  referenceRange?: string;
  interpretation?: string;
  technicianRemarks?: string;
  completedAt?: string;
  createdAt: string;
}

export function LabReportModal({
  report,
  onClose,
}: {
  report: LabReportData;
  onClose: () => void;
}) {
  const isCompleted = report.status === "COMPLETED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 print:hidden">
          <div className="flex items-center gap-2">
            <FlaskConical size={18} className="text-primary" />
            <span className="font-display font-semibold text-foreground">Diagnostic Lab Investigation Report</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-medium border ${
                isCompleted
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}
            >
              {isCompleted ? "Verified & Released" : report.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center gap-1.5"
              onClick={() => window.print()}
            >
              <Printer size={15} /> Print Report
            </Button>
            <button
              onClick={onClose}
              className="p-1 text-muted hover:text-foreground rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div id="printable-lab-report" className="p-8 bg-surface text-foreground print:p-0">
          {/* Header */}
          <div className="border-b-2 border-primary/20 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold font-display tracking-tight text-primary">
                  MEDICARE DIAGNOSTICS & PATHOLOGY LABORATORY
                </h1>
                <p className="text-xs text-muted mt-0.5">
                  NABL & CAP Accredited Clinical Laboratory & Imaging Services
                </p>
                <p className="text-xs text-muted">
                  Department of Laboratory Medicine &middot; Lab Helpline: +1 (800) 555-0144
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold tracking-wider uppercase border border-border rounded bg-muted/10">
                  LAB INVESTIGATION REPORT
                </span>
                <p className="text-xs text-muted mt-1 font-mono">
                  Report ID: <strong>{report.orderNumber}</strong>
                </p>
                <p className="text-xs text-muted">
                  Ordered: {new Date(report.createdAt).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 border border-border rounded-xl p-4 bg-muted/5">
            <div>
              <p className="text-muted font-medium mb-1 uppercase tracking-wider text-[10px]">Patient Details</p>
              <p className="font-semibold text-sm text-foreground">{report.patientName}</p>
              <p className="text-muted">MRN / Code: <span className="font-mono text-foreground">{report.patientCode}</span></p>
              <p className="text-muted">Sample Specimen: <strong className="text-foreground">{report.sampleType || "Blood"}</strong></p>
            </div>
            <div>
              <p className="text-muted font-medium mb-1 uppercase tracking-wider text-[10px]">Clinical Context</p>
              <p className="font-semibold text-sm text-foreground">Referred by: {report.doctorName}</p>
              <p className="text-muted">Investigation Discipline: {report.testCategory}</p>
              {report.clinicalNotes && (
                <p className="text-muted">Clinical Indication: {report.clinicalNotes}</p>
              )}
            </div>
          </div>

          {/* Test Name Header */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted uppercase tracking-wider block font-medium">Investigation Test</span>
              <h2 className="text-base font-bold text-foreground font-display">{report.testName}</h2>
            </div>
            {report.interpretation && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  report.interpretation.toLowerCase().includes("normal")
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-danger/10 text-danger border-danger/20"
                }`}
              >
                {report.interpretation}
              </span>
            )}
          </div>

          {/* Investigation Findings */}
          <div className="mb-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-muted">
                  <th className="py-2.5 px-3 font-semibold">Test Parameter / Analysis</th>
                  <th className="py-2.5 px-3 font-semibold">Observed Value</th>
                  <th className="py-2.5 px-3 font-semibold">Biological Reference Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-4 px-3 font-medium align-top">
                    {report.testName}
                    <span className="block text-[11px] text-muted mt-0.5">Automated Specimen Analyzer</span>
                  </td>
                  <td className="py-4 px-3 font-semibold text-foreground align-top">
                    {report.resultValue ? (
                      <span className="font-mono text-sm whitespace-pre-wrap">{report.resultValue}</span>
                    ) : (
                      <span className="italic text-muted">Awaiting laboratory specimen processing</span>
                    )}
                  </td>
                  <td className="py-4 px-3 text-muted align-top whitespace-pre-wrap">
                    {report.referenceRange || "Standard Reference Interval Applicable"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {report.technicianRemarks && (
            <div className="mb-6 p-3 bg-muted/5 border border-border rounded-xl text-xs">
              <span className="font-semibold text-foreground block mb-0.5">Laboratory Remarks & Impression:</span>
              <p className="text-muted">{report.technicianRemarks}</p>
            </div>
          )}

          {/* End of Report Verification */}
          <div className="border-t border-border/60 pt-6 mt-8 flex justify-between items-end text-[11px] text-muted">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <CheckCircle2 size={14} /> Digitally Authenticated Clinical Report
              </div>
              <p>Generated by Medicare Integrated Laboratory Information System (LIS).</p>
              {report.completedAt && (
                <p>Released on: {new Date(report.completedAt).toLocaleString()}</p>
              )}
            </div>
            <div className="text-right space-y-4">
              <div className="w-44 border-b border-dashed border-border" />
              <div>
                <p className="font-medium text-foreground">Dr. Sarah Jenkins, MD</p>
                <p className="text-[10px] text-muted">Chief Clinical Pathologist &amp; Lab Director</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
