"use client";

import { Printer, X, CheckCircle2 } from "lucide-react";
import { Button } from "./ui";

export interface ConsultationBillData {
  id: string;
  billNumber: string;
  appointmentId: string;
  tokenNumber: number;
  appointmentDate: string;
  appointmentTime: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientCode: string;
  doctorName: string;
  departmentName: string;
  consultationFee: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  transactionReference?: string;
  cashierName?: string;
  paidAt?: string;
  createdAt: string;
}

export function ConsultationReceiptModal({
  bill,
  onClose,
}: {
  bill: ConsultationBillData;
  onClose: () => void;
}) {
  const isPaid = bill.paymentStatus === "PAID";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-foreground">OPD Consultation Receipt</span>
            {isPaid ? (
              <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-600 font-medium border border-emerald-500/20">
                Paid in Full
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-600 font-medium border border-amber-500/20">
                Payment Due
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center gap-1.5"
              onClick={() => window.print()}
            >
              <Printer size={15} /> Print Receipt
            </Button>
            <button
              onClick={onClose}
              className="p-1 text-muted hover:text-foreground rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-8 bg-surface text-foreground print:p-0">
          {/* Hospital Header */}
          <div className="border-b-2 border-primary/20 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold font-display tracking-tight text-primary">
                  MEDICARE SUPER SPECIALITY HOSPITAL
                </h1>
                <p className="text-xs text-muted mt-0.5">
                  NABH Accredited &middot; ISO 9001:2015 Certified
                </p>
                <p className="text-xs text-muted">
                  42 Healthcare Avenue, Medical Enclave &middot; 24x7 Emergency: +1 (800) 555-0199
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold tracking-wider uppercase border border-border rounded bg-muted/10">
                  TAX INVOICE / RECEIPT
                </span>
                <p className="text-xs text-muted mt-1 font-mono">
                  Bill No: <strong>{bill.billNumber}</strong>
                </p>
                <p className="text-xs text-muted">
                  Date: {new Date(bill.createdAt).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Patient & Doctor Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 border border-border rounded-xl p-4 bg-muted/5">
            <div>
              <p className="text-muted font-medium mb-1 uppercase tracking-wider text-[10px]">Patient Details</p>
              <p className="font-semibold text-sm text-foreground">{bill.patientName}</p>
              <p className="text-muted">MRN / Code: <span className="font-mono text-foreground">{bill.patientCode}</span></p>
              <p className="text-muted">Contact: {bill.patientPhone || "—"}</p>
              <p className="text-muted">OPD Token: <strong className="text-foreground">#{bill.tokenNumber}</strong></p>
            </div>
            <div>
              <p className="text-muted font-medium mb-1 uppercase tracking-wider text-[10px]">Consultation Details</p>
              <p className="font-semibold text-sm text-foreground">{bill.doctorName}</p>
              <p className="text-muted">Department: {bill.departmentName}</p>
              <p className="text-muted">Visit Date: {bill.appointmentDate}</p>
              <p className="text-muted">Slot Time: {bill.appointmentTime}</p>
            </div>
          </div>

          {/* Charges Table */}
          <div className="mb-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-muted">
                  <th className="py-2 px-3 font-semibold w-12">#</th>
                  <th className="py-2 px-3 font-semibold">Service Description</th>
                  <th className="py-2 px-3 font-semibold text-right">Fee Rate</th>
                  <th className="py-2 px-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-3 px-3 text-muted">1</td>
                  <td className="py-3 px-3 font-medium">
                    Specialist OPD Consultation ({bill.departmentName})
                    <span className="block text-[11px] text-muted">Consulting Physician: {bill.doctorName}</span>
                  </td>
                  <td className="py-3 px-3 text-right">${Number(bill.consultationFee).toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-semibold">${Number(bill.consultationFee).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="flex justify-between items-start border-t border-border pt-4 mb-6">
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-medium">
                {isPaid ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Payment Received via <strong>{bill.paymentMethod || "CASH"}</strong></span>
                  </>
                ) : (
                  <span className="text-amber-600 font-medium">Awaiting payment collection at Cashier</span>
                )}
              </div>
              {bill.transactionReference && (
                <p className="text-muted font-mono text-[11px]">
                  Ref / Trans ID: {bill.transactionReference}
                </p>
              )}
              {bill.paidAt && (
                <p className="text-muted text-[11px]">
                  Paid At: {new Date(bill.paidAt).toLocaleString()}
                </p>
              )}
              {bill.cashierName && (
                <p className="text-muted text-[11px]">
                  Cashier: {bill.cashierName}
                </p>
              )}
            </div>

            <div className="w-56 text-xs space-y-1.5">
              <div className="flex justify-between text-muted">
                <span>Subtotal:</span>
                <span>${Number(bill.consultationFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Healthcare GST/Tax:</span>
                <span>$0.00 (Exempt)</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border pt-1.5 text-foreground">
                <span>Total Amount:</span>
                <span className="text-primary font-mono">${Number(bill.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Footer Note */}
          <div className="border-t border-border/60 pt-6 mt-8 flex justify-between items-end text-[11px] text-muted">
            <div>
              <p>Thank you for choosing Medicare Hospital.</p>
              <p>This is a computer-generated receipt and valid without physical seal.</p>
            </div>
            <div className="text-right space-y-4">
              <div className="w-40 border-b border-dashed border-border" />
              <p className="font-medium text-foreground">Authorized Cashier Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
