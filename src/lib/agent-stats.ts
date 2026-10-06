import type { MyBooking } from "@/lib/api/booking";
import type { SourceStat } from "@/components/booking-source";

// Figures for the agent's Dashboard and Reports, added up from the agent's own bookings.
// A ticket belongs to the day it was sold (India time). Cancelled tickets count as
// cancelled, never as revenue or commission.
// ponytail: works on the latest 200 bookings the server sends; move the sums to the
// server when an agent sells more than that in the period they look at.

const IST = "Asia/Kolkata";
const DAY_MS = 86_400_000;

/** YYYY-MM-DD in India for a moment in time. */
export const istDay = (at: Date | string) =>
  new Date(at).toLocaleDateString("en-CA", { timeZone: IST });
/** The day `n` days before the given YYYY-MM-DD. */
export const daysBefore = (day: string, n: number) =>
  istDay(new Date(new Date(`${day}T12:00:00+05:30`).getTime() - n * DAY_MS));

const stands = (b: MyBooking) => b.status !== "CANCELLED" && b.status !== "REFUNDED";

const SOURCE: Record<MyBooking["source"], SourceStat["source"]> = {
  AGENT: "Agent",
  COUNTER: "Counter",
  PHONE: "Phone",
  CORPORATE: "Corporate",
  OTA: "Agent",
};

export interface DayRow {
  date: string;
  bookings: number;
  revenue: number;
  commission: number;
  cancelled: number;
}

export function summarize(all: MyBooking[], from: string, to: string) {
  const inRange = all.filter((b) => {
    const day = istDay(b.createdAt);
    return day >= from && day <= to;
  });
  const sold = inRange.filter(stands);
  const sum = (rows: MyBooking[], pick: (b: MyBooking) => string) =>
    rows.reduce((t, b) => t + Number(pick(b)), 0);

  const days = new Map<string, DayRow>();
  for (let day = to; day >= from && days.size < 400; day = daysBefore(day, 1)) {
    days.set(day, { date: day, bookings: 0, revenue: 0, commission: 0, cancelled: 0 });
  }
  const sources = new Map<SourceStat["source"], SourceStat>(
    (["Agent", "Counter", "Phone", "Corporate"] as const).map((s) => [
      s,
      { source: s, count: 0, revenue: 0 },
    ]),
  );
  const routes = new Map<string, { route: string; tickets: number; revenue: number }>();

  for (const b of inRange) {
    const day = days.get(istDay(b.createdAt));
    if (!stands(b)) {
      if (day) day.cancelled += 1;
      continue;
    }
    const fare = Number(b.fare);
    if (day) {
      day.bookings += 1;
      day.revenue += fare;
      day.commission += Number(b.commission);
    }
    const src = sources.get(SOURCE[b.source])!;
    src.count += 1;
    src.revenue += fare;
    const name = `${b.trip.route.origin} → ${b.trip.route.destination}`;
    const route = routes.get(name) ?? { route: name, tickets: 0, revenue: 0 };
    route.tickets += 1;
    route.revenue += fare;
    routes.set(name, route);
  }

  const revenue = sum(sold, (b) => b.fare);
  return {
    bookings: sold.length,
    cancelled: inRange.length - sold.length,
    revenue,
    commission: sum(sold, (b) => b.commission),
    averageFare: sold.length ? Math.round(revenue / sold.length) : 0,
    /** Oldest day first. */
    daily: [...days.values()].reverse(),
    sources: [...sources.values()],
    routes: [...routes.values()].sort((a, b) => b.tickets - a.tickets),
  };
}
