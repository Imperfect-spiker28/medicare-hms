"use client";

import { useEffect, useState } from "react";
import { Card, Button, StatusPill, EmptyState } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import { FlaskConical, FileCheck2 } from "lucide-react";
import { LabReportModal, type LabReportData } from "@/components/lab-report-modal";

export default function PatientLabsPage() {
  const [orders, setOrders] = useState<LabReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<LabReportData | null>(null);

  useEffect(() => {
    let ignore = false;
    apiFetch<{ orders: LabReportData[] }>("/api/labs/my")
      .then((res) => {
        if (!ignore) setOrders(res.orders || []);
      })
      .catch(() => {
        if (!ignore) setOrders([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-foreground">Diagnostic Lab Reports</h1>
          <p className="text-sm text-muted">
            Access, view, and print official pathology and diagnostic test reports.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading your diagnostic records…</p>
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState
            title="No diagnostic lab investigations found"
            hint="When your consulting doctor orders blood work, imaging, or laboratory tests, reports will appear here."
          />
        </Card>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Card key={o.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FlaskConical size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">{o.testName}</p>
                    <span className="text-[11px] font-mono text-muted">({o.orderNumber})</span>
                  </div>
                  <p className="text-xs text-muted">
                    {o.testCategory} &middot; Specimen: {o.sampleType || "Blood"} &middot; Referred by {o.doctorName}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Ordered on {new Date(o.createdAt).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <StatusPill status={o.status} />
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-1.5 text-xs"
                  onClick={() => setSelectedReport(o)}
                >
                  <FileCheck2 size={14} /> View Report
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedReport && (
        <LabReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
