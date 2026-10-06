import { createFileRoute, Link } from "@tanstack/react-router";
import { AgentShell } from "@/components/AgentShell";
import {
  TicketPlus,
  TrendingUp,
  Wallet,
  Users,
  Printer,
  Search,
  History,
  CheckCircle2,
  XCircle,
  BellRing,
  MapPin,
  ArrowUpRight,
  IndianRupee,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import {
  SourceSummaryGrid,
  SourcePieChart,
  InventorySyncCard,
  type SourceStat,
} from "@/components/booking-source";

const DASHBOARD_SOURCE_STATS: SourceStat[] = [
  { source: "Agent", count: 14, revenue: 21450 },
  { source: "Counter", count: 8, revenue: 10800 },
  { source: "Phone", count: 4, revenue: 5650 },
  { source: "Corporate", count: 2, revenue: 4400 },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — KenRoute Agent Panel" },
      { name: "description", content: "Agent overview: bookings, revenue, commissions, and recent activity." },
    ],
  }),
  component: Dashboard,
});

/* ---------- Mock Data ---------- */
const stats = [
  { label: "Today's Bookings", value: "28", delta: "+12%", icon: TicketPlus, tint: "bg-brand-green/10 text-brand-green" },
  { label: "Revenue Today", value: "₹42,300", delta: "+8.4%", icon: TrendingUp, tint: "bg-blue-500/10 text-blue-600" },
  { label: "Commission Earned", value: "₹4,230", delta: "+9.1%", icon: IndianRupee, tint: "bg-amber-500/10 text-amber-600" },
  { label: "Total Passengers", value: "56", delta: "+5", icon: Users, tint: "bg-pink-500/10 text-pink-600" },
  { label: "Wallet Balance", value: "₹12,450", delta: "Available", icon: Wallet, tint: "bg-violet-500/10 text-violet-600" },
];

const quickActions: { label: string; to: string; icon: typeof TicketPlus; primary?: boolean }[] = [
  { label: "New Booking", to: "/new-booking", icon: TicketPlus, primary: true },
  { label: "Reprint Ticket", to: "/tickets", icon: Printer },
  { label: "Search Passenger", to: "/passengers", icon: Search },
  { label: "Booking History", to: "/booking-history", icon: History },
];


const recentBookings = [
  { id: "KR10421", name: "Ramesh Kumar", route: "HYD → BLR", seat: "L-12", amount: "₹1,250", status: "Confirmed" },
  { id: "KR10420", name: "Priya Sharma", route: "HYD → VJA", seat: "U-04", amount: "₹650", status: "Confirmed" },
  { id: "KR10419", name: "Anil Reddy", route: "BLR → MAA", seat: "L-08", amount: "₹980", status: "Pending" },
  { id: "KR10418", name: "Sunita Devi", route: "HYD → BLR", seat: "L-15", amount: "₹1,250", status: "Confirmed" },
  { id: "KR10417", name: "Vikram Singh", route: "HYD → VJA", seat: "U-11", amount: "₹650", status: "Cancelled" },
  { id: "KR10416", name: "Meera Joshi", route: "BLR → MAA", seat: "L-03", amount: "₹980", status: "Confirmed" },
];

const routeSummary = [
  { route: "Hyderabad → Bangalore", sold: 32, total: 48 },
  { route: "Hyderabad → Vijayawada", sold: 21, total: 36 },
  { route: "Bangalore → Chennai", sold: 14, total: 40 },
];

const commissions = [
  { label: "Today", value: "₹4,230" },
  { label: "This Week", value: "₹26,890" },
  { label: "This Month", value: "₹1,08,420" },
];

const notifications = [
  { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10", title: "Ticket KR10421 Confirmed", time: "2 min ago" },
  { icon: XCircle, color: "text-rose-600 bg-rose-500/10", title: "Ticket KR10417 Cancelled", time: "18 min ago" },
  { icon: Wallet, color: "text-amber-600 bg-amber-500/10", title: "Wallet Credited ₹150", time: "1 hr ago" },
  { icon: MapPin, color: "text-blue-600 bg-blue-500/10", title: "New Route: Pune → Goa available", time: "3 hr ago" },
];

const weekBookings = [12, 18, 15, 22, 28, 24, 28];
const weekRevenue = [18, 26, 22, 31, 38, 34, 42];
const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ---------- Component ---------- */
function Dashboard() {
  return (
    <AgentShell title="Dashboard">
      <div className="space-y-6">
        {/* Welcome strip */}
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-gradient-to-r from-navy to-navy-deep p-5 text-white shadow-card sm:flex-row sm:items-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60">Welcome back</div>
            <div className="mt-0.5 text-xl font-semibold">Anil Agent · AGT1024</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
              <Calendar className="h-3.5 w-3.5" />
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
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
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card transition hover:shadow-elevated">
              <div className="flex items-start justify-between">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.tint}`}>
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
                  <div className={
                    a.primary
                      ? "flex h-10 w-10 items-center justify-center rounded-lg bg-white/15"
                      : "flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green"
                  }>
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold">{a.label}</div>
                </div>
                <ArrowUpRight className={a.primary ? "h-4 w-4 text-white/80" : "h-4 w-4 text-muted-foreground group-hover:text-brand-green"} />
              </Link>
            ))}
          </div>
        </section>

        {/* Booking Source Analytics + Inventory Sync */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SourceSummaryGrid stats={DASHBOARD_SOURCE_STATS} />
            <SourcePieChart stats={DASHBOARD_SOURCE_STATS} />
          </div>
          <InventorySyncCard />
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Bookings */}
          <section className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Recent Bookings</h2>
              <Link to="/booking-history" className="text-xs font-semibold text-brand-green hover:underline">
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
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-foreground">{b.id}</td>
                      <td className="px-3 py-3 text-foreground">{b.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{b.route}</td>
                      <td className="px-3 py-3 font-mono text-xs">{b.seat}</td>
                      <td className="px-3 py-3 font-semibold">{b.amount}</td>
                      <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
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
                      <div className="text-xs uppercase tracking-wider text-white/70">{c.label}</div>
                      <div className="mt-1 text-2xl font-bold">{c.value}</div>
                      <div className="mt-1 text-[11px] text-white/70">Paid out by your operator</div>
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
              <h2 className="text-base font-semibold">Today's Route Summary</h2>
              <span className="text-xs text-muted-foreground">Live occupancy</span>
            </div>
            <div className="space-y-3">
              {routeSummary.map((r) => {
                const occ = Math.round((r.sold / r.total) * 100);
                return (
                  <div key={r.route} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-brand-green" />
                        <span className="text-sm font-semibold text-foreground">{r.route}</span>
                      </div>
                      <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[11px] font-bold text-brand-green">
                        {occ}% full
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-muted-foreground">Tickets Sold</div>
                        <div className="mt-0.5 text-sm font-bold text-foreground">{r.sold}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Available</div>
                        <div className="mt-0.5 text-sm font-bold text-foreground">{r.total - r.sold}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Capacity</div>
                        <div className="mt-0.5 text-sm font-bold text-foreground">{r.total}</div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-green to-brand-green-dark"
                        style={{ width: `${occ}%` }}
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
              <h2 className="text-base font-semibold">Notifications</h2>
              <BellRing className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.color}`}>
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

          <PassengerSearch />
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
    Cancelled: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${map[status]}`}>
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

function MiniChart({ bookings, revenue, labels }: { bookings: number[]; revenue: number[]; labels: string[] }) {
  const w = 560;
  const h = 200;
  const pad = 28;
  const maxB = Math.max(...bookings) * 1.2;
  const maxR = Math.max(...revenue) * 1.2;
  const stepX = (w - pad * 2) / (labels.length - 1);

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
          return <circle key={i} cx={x} cy={y} r={3.5} className="fill-white" stroke="#3b82f6" strokeWidth={2} />;
        })}

        {/* x labels */}
        {labels.map((l, i) => (
          <text
            key={l}
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

function PassengerSearch() {
  const [tab, setTab] = useState<"mobile" | "booking">("mobile");
  const [value, setValue] = useState("");
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
          onChange={(e) => setValue(e.target.value)}
          placeholder={tab === "mobile" ? "e.g. 9876543210" : "e.g. KR10421"}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <button className="mt-3 w-full rounded-lg bg-brand-green py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark">
        Search
      </button>

      <div className="mt-4 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
        Tip: You can also scan a printed ticket QR from the New Booking page.
      </div>
    </section>
  );
}
