"use client";

import { useState } from "react";
import { CreditCard, X, DollarSign } from "lucide-react";
import { Button, Input, Select } from "./ui";
import { apiFetch } from "@/lib/api-client";
import type { ConsultationBillData } from "./consultation-receipt-modal";

export function CollectPaymentModal({
  appointmentId,
  patientName,
  tokenNumber,
  onClose,
  onSuccess,
}: {
  appointmentId: string;
  patientName: string;
  tokenNumber: number;
  onClose: () => void;
  onSuccess: (bill: ConsultationBillData) => void;
}) {
  const [amount, setAmount] = useState<number>(50.00);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [transactionReference, setTransactionReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCollect(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch<{ bill: ConsultationBillData }>(
        `/api/billing/appointments/${appointmentId}/pay`,
        {
          method: "POST",
          body: JSON.stringify({
            amount,
            paymentMethod,
            transactionReference: transactionReference.trim() || undefined,
            notes: notes.trim() || undefined,
          }),
        }
      );
      onSuccess(res.bill);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          <div className="flex items-center gap-2 text-foreground font-display font-semibold">
            <DollarSign size={20} className="text-primary" /> Collect OPD Consultation Fee
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-foreground rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-muted/10 rounded-xl p-3 mb-4 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted">Patient:</span>
            <span className="font-semibold text-foreground">{patientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">OPD Token:</span>
            <span className="font-semibold text-primary font-mono">#{tokenNumber}</span>
          </div>
        </div>

        <form onSubmit={handleCollect} className="space-y-4">
          <Input
            label="Consultation Fee ($)"
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI / QR Code</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="INSURANCE">Insurance / TPA</option>
            <option value="FREE_WAIVED">Fee Waived / Free</option>
          </Select>

          {paymentMethod !== "CASH" && paymentMethod !== "FREE_WAIVED" && (
            <Input
              label="Transaction / Reference ID"
              placeholder="e.g. UPI-9281728 or Card Auth Code"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
            />
          )}

          <Input
            label="Cashier Remarks (Optional)"
            placeholder="e.g. Counter #1 collection"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-1/2 flex items-center justify-center gap-1.5">
              <CreditCard size={15} />
              {loading ? "Processing…" : "Confirm Paid"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
