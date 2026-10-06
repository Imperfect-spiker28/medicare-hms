import type { Database, DoctorDay } from "@/lib/db/types";

const DAY_INDEX: DoctorDay[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

/**
 * Builds the day's slot grid for a doctor and marks which slots are already
 * taken by active (non-cancelled) appointments. Pure function — no I/O — so
 * it's easy to unit test independent of the data layer.
 */
export function getSlotsForDoctorOnDate(
  db: Database,
  doctorId: string,
  dateISO: string
): Slot[] {
  const profile = db.doctorProfiles.find((d) => d.userId === doctorId);
  if (!profile) return [];

  if (profile.onLeaveDates.includes(dateISO)) return [];

  const dayOfWeek = DAY_INDEX[new Date(`${dateISO}T00:00:00`).getDay()];
  const windows = profile.availability.filter((a) => a.day === dayOfWeek);
  if (windows.length === 0) return [];

  const bookedTimes = new Set(
    db.appointments
      .filter(
        (a) =>
          a.doctorId === doctorId &&
          a.date === dateISO &&
          a.status !== "CANCELLED" &&
          a.status !== "NO_SHOW"
      )
      .map((a) => a.startTime)
  );

  const slots: Slot[] = [];
  for (const w of windows) {
    let cursor = w.startTime;
    while (cursor < w.endTime) {
      const end = addMinutes(cursor, w.slotMinutes);
      if (end > w.endTime) break;
      slots.push({ startTime: cursor, endTime: end, available: !bookedTimes.has(cursor) });
      cursor = end;
    }
  }
  return slots;
}

export function nextTokenNumber(db: Database, doctorId: string, dateISO: string): number {
  const todays = db.appointments.filter(
    (a) => a.doctorId === doctorId && a.date === dateISO && a.status !== "CANCELLED"
  );
  return todays.length + 1;
}
