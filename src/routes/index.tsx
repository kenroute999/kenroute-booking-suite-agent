import { createFileRoute, Link } from "@tanstack/react-router";
import { AgentShell } from "@/components/AgentShell";
import {
  TicketPlus,
  TrendingUp,
  Users,
  Printer,
  Search,
  History,
  CheckCircle2,
  XCircle,
  BellRing,
  Ban,
  MapPin,
  ArrowUpRight,
  IndianRupee,
  Calendar,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SourceSummaryGrid, SourcePieChart } from "@/components/booking-source";
import { useSession } from "@/lib/session";
import {
  bookingView,
  listMyBookingsSince,
  myBookingsSinceKey,
  rupees,
  todayInIndia,
  type MyBooking,
} from "@/lib/api/booking";
import { daysBefore, istDay, summarize } from "@/lib/agent-stats";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — KenRoute Agent Panel" },
      {
        name: "description",
        content: "Agent overview: bookings, revenue, commissions, and recent activity.",
      },
    ],
  }),
  component: Dashboard,
});

const quickActions: { label: string; to: string; icon: typeof TicketPlus; primary?: boolean }[] = [
  { label: "New Booking", to: "/new-booking", icon: TicketPlus, primary: true },
  { label: "Reprint Ticket", to: "/tickets", icon: Printer },
  { label: "Search Passenger", to: "/passengers", icon: Search },
  { label: "Booking History", to: "/booking-history", icon: History },
];

const STATUS_LABEL: Record<MyBooking["status"], string> = {
  CREATED: "Pending",
  CONFIRMED: "Confirmed",
  BOARDED: "Boarded",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Cancelled",
};

function ago(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} hr ago`;
  return `${Math.round(mins / 1440)} day(s) ago`;
}

/* ---------- Component ---------- */
function Dashboard() {
  const { session } = useSession();
  const today = todayInIndia();
  const monthStart = `${today.slice(0, 8)}01`;
  const weekStart = daysBefore(today, 6);
  // Far enough back for both "this month" and "last 7 days".
  const since = monthStart < weekStart ? monthStart : weekStart;
  const query = useQuery({
    queryKey: myBookingsSinceKey(since),
    queryFn: () => listMyBookingsSince(since),
    refetchInterval: 60_000,
  });
  const all = useMemo(() => query.data ?? [], [query.data]);

  const day = useMemo(() => summarize(all, today, today), [all, today]);
  const week = useMemo(() => summarize(all, weekStart, today), [all, weekStart, today]);
  const month = useMemo(() => summarize(all, monthStart, today), [all, monthStart, today]);
  const show = (value: string) => (query.isPending ? "—" : value);

  const stats = [
    {
      label: "Today's Bookings",
      value: show(String(day.bookings)),
      delta: "Today",
      icon: TicketPlus,
      tint: "bg-brand-green/10 text-brand-green",
    },
    {
      label: "Revenue Today",
      value: show(rupees(day.revenue)),
      delta: "Today",
      icon: TrendingUp,
      tint: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Commission Earned",
      value: show(rupees(day.commission)),
      delta: "Today",
      icon: IndianRupee,
      tint: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Passengers This Month",
      value: show(String(month.bookings)),
      delta: "This month",
      icon: Users,
      tint: "bg-pink-500/10 text-pink-600",
    },
    {
      label: "Cancelled This Month",
      value: show(String(month.cancelled)),
      delta: "This month",
      icon: Ban,
      tint: "bg-violet-500/10 text-violet-600",
    },
  ];
  const recentBookings = all.slice(0, 6).map((b) => {
    const v = bookingView(b);
    return {
      key: b.id,
      id: v.pnr,
      name: v.passenger,
      route: v.route,
      seat: v.seat,
      amount: rupees(v.amount),
      status: STATUS_LABEL[b.status],
    };
  });
  const commissions = [
    { label: "Today", value: rupees(day.commission) },
    { label: "This Week", value: rupees(week.commission) },
    { label: "This Month", value: rupees(month.commission) },
  ];
  const notifications = all.slice(0, 4).map((b) => {
    const cancelled = b.status === "CANCELLED" || b.status === "REFUNDED";
    return {
      icon: cancelled ? XCircle : CheckCircle2,
      color: cancelled ? "text-rose-600 bg-rose-500/10" : "text-emerald-600 bg-emerald-500/10",
      title: `Ticket ${b.pnr} · Seat ${b.seatNumber} ${cancelled ? "Cancelled" : STATUS_LABEL[b.status]}`,
      time: ago(b.createdAt),
    };
  });
  const weekLabels = week.daily.map((d) =>
    new Date(`${d.date}T12:00:00+05:30`).toLocaleDateString("en-IN", {
      weekday: "short",
      timeZone: "Asia/Kolkata",
    }),
  );
  const weekBookings = week.daily.map((d) => d.bookings);
  const weekRevenue = week.daily.map((d) => d.revenue / 1000);
  const displayName = session?.user.name?.trim() || session?.user.email || "Agent";

  return (
    <AgentShell title="Dashboard">
      <div className="space-y-6">
        {/* Welcome strip */}
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-gradient-to-r from-navy to-navy-deep p-5 text-white shadow-card sm:flex-row sm:items-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60">Welcome back</div>
            <div className="mt-0.5 text-xl font-semibold">
              {displayName}
              {session?.user.agentCode ? ` · ${session.user.agentCode}` : ""}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
              <Calendar className="h-3.5 w-3.5" />
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <Link
            to="/new-booking"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark"
          >
            <TicketPlus className="h-4 w-4" />
            New Booking
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-card transition hover:shadow-elevated"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.tint}`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {s.delta}
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Quick Actions</h2>
            <span className="text-xs text-muted-foreground">Frequently used</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to as "/"}
                className={
                  a.primary
                    ? "group flex items-center justify-between rounded-xl bg-brand-green px-5 py-4 text-white shadow-card transition hover:bg-brand-green-dark"
                    : "group flex items-center justify-between rounded-xl border border-border bg-background px-5 py-4 transition hover:border-brand-green/40 hover:bg-brand-green/5"
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className={
                      a.primary
                        ? "flex h-10 w-10 items-center justify-center rounded-lg bg-white/15"
                        : "flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green"
                    }
                  >
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold">{a.label}</div>
                </div>
                <ArrowUpRight
                  className={
                    a.primary
                      ? "h-4 w-4 text-white/80"
                      : "h-4 w-4 text-muted-foreground group-hover:text-brand-green"
                  }
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Booking Source Analytics, this month */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SourceSummaryGrid stats={month.sources} />
          <SourcePieChart stats={month.sources} />
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Bookings */}
          <section className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Recent Bookings</h2>
              <Link
                to="/booking-history"
                className="text-xs font-semibold text-brand-green hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Booking ID</th>
                    <th className="px-3 py-3 font-medium">Passenger</th>
                    <th className="px-3 py-3 font-medium">Route</th>
                    <th className="px-3 py-3 font-medium">Seat</th>
                    <th className="px-3 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">
                        {query.isPending
                          ? "Loading…"
                          : query.isError
                            ? "Could not load your bookings."
                            : "No bookings yet."}
                      </td>
                    </tr>
                  )}
                  {recentBookings.map((b) => (
                    <tr key={b.key} className="border-t border-border hover:bg-muted/30">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-foreground">
                        {b.id}
                      </td>
                      <td className="px-3 py-3 text-foreground">{b.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{b.route}</td>
                      <td className="px-3 py-3 font-mono text-xs">{b.seat}</td>
                      <td className="px-3 py-3 font-semibold">{b.amount}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Commission Summary */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Commission Summary</h2>
              <IndianRupee className="h-4 w-4 text-brand-green" />
            </div>
            <div className="space-y-3">
              {commissions.map((c, i) => (
                <div
                  key={c.label}
                  className={
                    i === 0
                      ? "rounded-xl bg-gradient-to-br from-brand-green to-brand-green-dark p-4 text-white shadow-card"
                      : "flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                  }
                >
                  {i === 0 ? (
                    <>
                      <div className="text-xs uppercase tracking-wider text-white/70">
                        {c.label}
                      </div>
                      <div className="mt-1 text-2xl font-bold">{c.value}</div>
                      <div className="mt-1 text-[11px] text-white/70">
                        Paid out by your operator
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">{c.label}</span>
                      <span className="text-sm font-bold text-foreground">{c.value}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Second grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Route Summary */}
          <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">My Routes This Month</h2>
              <span className="text-xs text-muted-foreground">Tickets you sold</span>
            </div>
            <div className="space-y-3">
              {month.routes.length === 0 && (
                <p className="text-sm text-muted-foreground">No tickets sold this month yet.</p>
              )}
              {month.routes.slice(0, 4).map((r) => {
                const share = Math.round((r.tickets / (month.bookings || 1)) * 100);
                return (
                  <div key={r.route} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-brand-green" />
                        <span className="text-sm font-semibold text-foreground">{r.route}</span>
                      </div>
                      <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[11px] font-bold text-brand-green">
                        {share}% of your sales
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-muted-foreground">Tickets Sold</div>
                        <div className="mt-0.5 text-sm font-bold text-foreground">{r.tickets}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Revenue</div>
                        <div className="mt-0.5 text-sm font-bold text-foreground">
                          {rupees(r.revenue)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-green to-brand-green-dark"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Latest Activity</h2>
              <BellRing className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {notifications.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing yet.</p>
              )}
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.color}`}
                  >
                    <n.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{n.title}</div>
                    <div className="text-[11px] text-muted-foreground">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Analytics + Search */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Performance Analytics</h2>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <LegendDot className="bg-brand-green" label="Bookings" />
                <LegendDot className="bg-blue-500" label="Revenue (₹k)" />
              </div>
            </div>
            <MiniChart bookings={weekBookings} revenue={weekRevenue} labels={weekLabels} />
          </section>

          <PassengerSearch bookings={all} />
        </div>
      </div>
    </AgentShell>
  );
}

/* ---------- Helpers ---------- */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Confirmed: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
    Pending: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
    Boarded: "bg-blue-500/10 text-blue-700 ring-blue-500/20",
    Completed: "bg-slate-500/10 text-slate-700 ring-slate-500/20",
    Cancelled: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${map[status]}`}
    >
      {status}
    </span>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className={`inline-block h-2 w-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function MiniChart({
  bookings,
  revenue,
  labels,
}: {
  bookings: number[];
  revenue: number[];
  labels: string[];
}) {
  const w = 560;
  const h = 200;
  const pad = 28;
  const maxB = Math.max(...bookings, 1) * 1.2;
  const maxR = Math.max(...revenue, 1) * 1.2;
  const stepX = (w - pad * 2) / Math.max(labels.length - 1, 1);

  const linePath = (data: number[], max: number) =>
    data
      .map((v, i) => {
        const x = pad + i * stepX;
        const y = h - pad - (v / max) * (h - pad * 2);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full">
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={pad}
            x2={w - pad}
            y1={pad + t * (h - pad * 2)}
            y2={pad + t * (h - pad * 2)}
            stroke="currentColor"
            className="text-border"
            strokeDasharray="3 3"
          />
        ))}

        {/* bookings bars */}
        {bookings.map((v, i) => {
          const bh = (v / maxB) * (h - pad * 2);
          const x = pad + i * stepX - 10;
          return (
            <rect
              key={i}
              x={x}
              y={h - pad - bh}
              width={20}
              height={bh}
              rx={4}
              className="fill-brand-green/70"
            />
          );
        })}

        {/* revenue line */}
        <path d={linePath(revenue, maxR)} fill="none" stroke="#3b82f6" strokeWidth={2.5} />
        {revenue.map((v, i) => {
          const x = pad + i * stepX;
          const y = h - pad - (v / maxR) * (h - pad * 2);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3.5}
              className="fill-white"
              stroke="#3b82f6"
              strokeWidth={2}
            />
          );
        })}

        {/* x labels */}
        {labels.map((l, i) => (
          <text
            key={i}
            x={pad + i * stepX}
            y={h - 6}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}

function PassengerSearch({ bookings }: { bookings: MyBooking[] }) {
  const [tab, setTab] = useState<"mobile" | "booking">("mobile");
  const [value, setValue] = useState("");
  const term = value.trim().toUpperCase();
  const found =
    term.length < 3
      ? []
      : bookings
          .filter((b) =>
            tab === "mobile" ? (b.passenger?.phone ?? "").includes(term) : b.pnr.includes(term),
          )
          .slice(0, 4);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="text-base font-semibold">Passenger Search</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Quickly locate a booking</p>

      <div className="mt-4 inline-flex rounded-lg bg-muted p-1 text-xs font-semibold">
        <button
          onClick={() => setTab("mobile")}
          className={`rounded-md px-3 py-1.5 ${tab === "mobile" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          Mobile Number
        </button>
        <button
          onClick={() => setTab("booking")}
          className={`rounded-md px-3 py-1.5 ${tab === "booking" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          Booking ID
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) =>
            setValue(
              tab === "mobile" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value,
            )
          }
          inputMode={tab === "mobile" ? "numeric" : undefined}
          maxLength={tab === "mobile" ? 10 : undefined}
          placeholder={tab === "mobile" ? "e.g. 9876543210" : "PNR, e.g. KRAB12CD"}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="mt-3 space-y-2">
        {term.length >= 3 && found.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
            No booking of yours matches.
          </div>
        )}
        {found.map((b) => (
          <Link
            key={b.id}
            to="/tickets"
            className="block rounded-lg border border-border bg-background p-3 text-xs hover:border-brand-green/40"
          >
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span>{b.passenger?.name ?? "Passenger"}</span>
              <span className="font-mono">{b.pnr}</span>
            </div>
            <div className="mt-0.5 text-muted-foreground">
              {b.trip.route.origin} → {b.trip.route.destination} · Seat {b.seatNumber} ·{" "}
              {istDay(b.trip.departureAt)} · {STATUS_LABEL[b.status]}
            </div>
          </Link>
        ))}
        {term.length < 3 && (
          <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
            Type at least 3 characters. Searches the bookings you made.
          </div>
        )}
      </div>
    </section>
  );
}
