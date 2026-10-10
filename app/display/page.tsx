"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Stethoscope, Volume2, VolumeX, Maximize2, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface QueueItem {
  doctorId: string;
  doctorName: string;
  departmentName: string;
  roomNumber: string;
  currentToken: number | null;
  currentStatus: string;
  waitingTokens: number[];
  totalCompletedToday: number;
}

interface DisplayData {
  date: string;
  hospitalName: string;
  queues: QueueItem[];
}

export default function OPDDisplayPage() {
  const [data, setData] = useState<DisplayData | null>(null);
  const [timeStr, setTimeStr] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const prevTokensRef = useRef<Record<string, number | null>>({});

  // Clock
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll live queue every 6 seconds with bounded interval
  const dataRef = useRef<DisplayData | null>(null);
  dataRef.current = data;

  useEffect(() => {
    let ignore = false;
    let isFetching = false;

    function fetchQueue() {
      if (isFetching) return;
      isFetching = true;
      apiFetch<DisplayData>("/api/display/queue")
        .then((res) => {
          if (ignore) return;
          if (soundEnabled && dataRef.current) {
            let hasChanged = false;
            res.queues.forEach((q) => {
              const old = prevTokensRef.current[q.doctorId];
              if (q.currentToken && old && q.currentToken !== old) {
                hasChanged = true;
              }
              prevTokensRef.current[q.doctorId] = q.currentToken;
            });
            if (hasChanged) {
              playChime();
            }
          } else {
            res.queues.forEach((q) => {
              prevTokensRef.current[q.doctorId] = q.currentToken;
            });
          }
          setData(res);
        })
        .catch(() => {
          // Bounded backoff: interval continues at 6000ms without rapid retry storm
        })
        .finally(() => {
          isFetching = false;
        });
    }

    fetchQueue();
    const timer = setInterval(fetchQueue, 6000);
    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, [soundEnabled]);

  function playChime() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not permitted or supported
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  const queues = data?.queues || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header Board */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/80 px-2.5 py-1.5 rounded-lg"
          >
            <ArrowLeft size={14} /> Exit
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Stethoscope size={22} />
            </div>
            <div>
              <h1 className="font-display font-bold text-base sm:text-xl text-white tracking-tight leading-tight">
                Medicare Hospital, Irinjalakuda
              </h1>
              <p className="text-[10px] sm:text-xs text-teal-400 font-medium tracking-wide uppercase">
                Outpatient Department &middot; Live Token Queue
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              if (!soundEnabled) playChime();
              setSoundEnabled(!soundEnabled);
            }}
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {soundEnabled ? (
              <>
                <Volume2 size={16} className="text-emerald-400" /> Chimes Active
              </>
            ) : (
              <>
                <VolumeX size={16} className="text-slate-500" /> Chimes Muted
              </>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 size={16} />
          </button>

          <div className="bg-slate-800/90 border border-slate-700/60 px-4 py-1.5 rounded-xl font-mono text-xl font-bold tracking-wider text-teal-300 shadow-inner">
            {timeStr || "10:00:00 AM"}
          </div>
        </div>
      </header>

      {/* Main Grid: Consultation Chambers */}
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full items-stretch">
        {queues.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-500">
            <Stethoscope size={48} className="mb-3 opacity-30" />
            <p className="text-lg font-medium text-slate-400">Connecting to OPD Consultation Desks…</p>
            <p className="text-sm mt-1">Live queue data updates automatically</p>
          </div>
        ) : (
          queues.map((q) => {
            const isConsulting = q.currentStatus === "IN_CONSULTATION";
            return (
              <div
                key={q.doctorId}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-300 hover:border-slate-700"
              >
                {/* Doctor & Room Top Tag */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {q.departmentName}
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-lg">
                      {q.roomNumber}
                    </span>
                  </div>

                  <h2 className="text-xl font-display font-bold text-white mb-1">
                    {q.doctorName}
                  </h2>
                  <p className="text-xs text-slate-400 mb-6">OPD Consultation Chamber</p>
                </div>

                {/* Big Serving Token Showcase */}
                <div className="my-auto py-4 flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl border border-slate-800/80 p-6 text-center shadow-inner">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2 flex items-center gap-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        isConsulting ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                      }`}
                    />
                    {isConsulting ? "Now Serving" : "Next In Line"}
                  </span>

                  <div className="text-6xl font-black font-display tracking-tight text-white mb-2">
                    {q.currentToken ? (
                      <span className="bg-gradient-to-r from-teal-300 via-teal-100 to-white bg-clip-text text-transparent">
                        #{q.currentToken}
                      </span>
                    ) : (
                      <span className="text-3xl text-slate-600 font-medium">Idle</span>
                    )}
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      isConsulting
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isConsulting ? "In Consultation" : "Awaiting Patient"}
                  </span>
                </div>

                {/* Waiting Line & Stats */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-medium text-slate-300">Upcoming Tokens:</span>
                    <span>Completed: <strong className="text-teal-400">{q.totalCompletedToday}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
                    {q.waitingTokens.length === 0 ? (
                      <span className="text-xs text-slate-600 italic">No waiting queue</span>
                    ) : (
                      q.waitingTokens.map((t, idx) => (
                        <span
                          key={t}
                          className={`font-mono text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                            idx === 0
                              ? "bg-teal-950/60 text-teal-300 border-teal-700/60"
                              : "bg-slate-800 text-slate-300 border-slate-700/50"
                          }`}
                        >
                          #{t}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Footer Banner */}
      <footer className="bg-slate-900/90 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time OPD Token Queue Synchronizer</span>
        </div>
        <p>Please proceed to your respective consultation chamber when your token is called.</p>
        <span className="text-slate-500 font-mono">v1.0 &middot; Medicare Irinjalakuda</span>
      </footer>
    </div>
  );
}
