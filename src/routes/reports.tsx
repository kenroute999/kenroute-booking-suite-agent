import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AgentShell } from "@/components/AgentShell";
import {
  TicketCheck,
  IndianRupee,
  Percent,
  Users,
  Receipt,
  Filter,
  Download,
  FileText,
  FileSpreadsheet,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

const STATS = [
  { label: "Total Bookings", value: "2,184", delta: "+12.4%", icon: TicketCheck, tone: "text-brand-green" },
  { label: "Total Revenue", value: "₹18,45,200", delta: "+9.1%", icon: IndianRupee, tone: "text-brand-green" },
  { label: "Total Commission", value: "₹92,260", delta: "+11.2%", icon: Percent, tone: "text-brand-green" },
  { label: "Total Passengers", value: "3,021", delta: "+6.8%", icon: Users, tone: "text-brand-green" },
  { label: "Avg Ticket Value", value: "₹845", delta: "+2.1%", icon: Receipt, tone: "text-brand-green" },
];

const DAILY_BOOKINGS = [42, 56, 48, 62, 71, 64, 80, 75, 88, 92, 78, 96, 110, 102];
const REVENUE_TREND = [62, 70, 65, 78, 85, 80, 92, 88, 100, 108, 95, 112, 124, 118];
const COMMISSION_TREND = [3.1, 3.6, 3.4, 4.1, 4.6, 4.3, 4.9, 4.7, 5.4, 5.8, 5.1, 6.0, 6.7, 6.4];

const TOP_ROUTES = [
  { route: "Hyderabad → Bangalore", tickets: 412, revenue: 348200, occupancy: 92 },
  { route: "Hyderabad → Chennai", tickets: 318, revenue: 286400, occupancy: 88 },
  { route: "Bangalore → Mumbai", tickets: 276, revenue: 312900, occupancy: 85 },
  { route: "Vijayawada → Hyderabad", tickets: 245, revenue: 168700, occupancy: 81 },
  { route: "Chennai → Coimbatore", tickets: 198, revenue: 142500, occupancy: 76 },
  { route: "Tirupati → Bangalore", tickets: 172, revenue: 124300, occupancy: 73 },
];

const SALES_REPORT = [
  { date: "31 May 2026", bookings: 110, revenue: 96400, commission: 4820, passengers: 152 },
  { date: "30 May 2026", bookings: 102, revenue: 89600, commission: 4480, passengers: 141 },
  { date: "29 May 2026", bookings: 96, revenue: 82100, commission: 4105, passengers: 132 },
  { date: "28 May 2026", bookings: 88, revenue: 74800, commission: 3740, passengers: 121 },
  { date: "27 May 2026", bookings: 92, revenue: 78200, commission: 3910, passengers: 126 },
  { date: "26 May 2026", bookings: 80, revenue: 68400, commission: 3420, passengers: 110 },
  { date: "25 May 2026", bookings: 75, revenue: 64100, commission: 3205, passengers: 102 },
];

function StatCard({ s }: { s: (typeof STATS)[number] }) {
  const Icon = s.icon;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</div>
        <div className="rounded-lg bg-brand-green/10 p-2"><Icon className={`h-4 w-4 ${s.tone}`} /></div>
      </div>
      <div className="mt-3 text-2xl font-bold text-foreground">{s.value}</div>
      <div className="mt-1 text-[11px] font-semibold text-brand-green">{s.delta} vs last period</div>
    </div>
  );
}

function BarChart({ data, color = "var(--brand-green)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-40 items-end gap-1.5">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-md transition-all hover:opacity-80"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.85 }} />
      ))}
    </div>
  );
}

function LineChart({ data, color = "var(--brand-green)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 100, h = 100;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-40 w-full">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
      <polyline fill={color} fillOpacity="0.12" stroke="none"
        points={`0,${h} ${points} ${w},${h}`} />
    </svg>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
        <TrendingUp className="h-4 w-4 text-brand-green" />
      </div>
      {children}
    </div>
  );
}

function ReportsPage() {
  const [from, setFrom] = useState("2026-05-25");
  const [to, setTo] = useState("2026-05-31");

  return (
    <AgentShell title="Reports & Analytics">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-brand-green" /> Filters
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm" />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground">Route</label>
          <select className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option>All Routes</option>
            <option>Hyderabad → Bangalore</option>
            <option>Hyderabad → Chennai</option>
            <option>Bangalore → Mumbai</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground">Status</label>
          <select className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option>All</option>
            <option>Confirmed</option>
            <option>Cancelled</option>
            <option>Pending</option>
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-muted">
            <FileSpreadsheet className="h-4 w-4" /> CSV
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-muted">
            <FileText className="h-4 w-4" /> PDF
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded-md bg-brand-green px-3 text-sm font-semibold text-white hover:opacity-90">
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {STATS.map((s) => <StatCard key={s.label} s={s} />)}
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Daily Bookings Trend" subtitle="Last 14 days">
          <BarChart data={DAILY_BOOKINGS} />
        </ChartCard>
        <ChartCard title="Revenue Trend" subtitle="In ₹ thousands">
          <LineChart data={REVENUE_TREND} />
        </ChartCard>
        <ChartCard title="Commission Trend" subtitle="In ₹ thousands">
          <BarChart data={COMMISSION_TREND.map((v) => v * 10)} color="#1e3a8a" />
        </ChartCard>
        <ChartCard title="Route Performance" subtitle="Tickets sold per route">
          <div className="space-y-3">
            {TOP_ROUTES.slice(0, 5).map((r) => (
              <div key={r.route}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{r.route}</span>
                  <span className="text-muted-foreground">{r.tickets} tickets</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand-green" style={{ width: `${(r.tickets / 412) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Top Routes Table */}
      <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Top Performing Routes</div>
            <div className="text-xs text-muted-foreground">Highest ticket volume in selected period</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Route</th>
                <th className="px-5 py-3 text-right font-medium">Tickets Sold</th>
                <th className="px-5 py-3 text-right font-medium">Revenue</th>
                <th className="px-5 py-3 text-left font-medium">Occupancy Rate</th>
              </tr>
            </thead>
            <tbody>
              {TOP_ROUTES.map((r) => (
                <tr key={r.route} className="border-t border-border">
                  <td className="px-5 py-3 font-medium text-foreground">{r.route}</td>
                  <td className="px-5 py-3 text-right">{r.tickets}</td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground">₹{r.revenue.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-brand-green" style={{ width: `${r.occupancy}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{r.occupancy}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Report */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Daily Sales Report</div>
            <div className="text-xs text-muted-foreground">Day-wise breakdown of bookings & commission</div>
          </div>
          <button className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-muted">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Total Bookings</th>
                <th className="px-5 py-3 text-right font-medium">Revenue</th>
                <th className="px-5 py-3 text-right font-medium">Commission</th>
                <th className="px-5 py-3 text-right font-medium">Passengers</th>
              </tr>
            </thead>
            <tbody>
              {SALES_REPORT.map((r) => (
                <tr key={r.date} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-foreground">{r.date}</td>
                  <td className="px-5 py-3 text-right">{r.bookings}</td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground">₹{r.revenue.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-right text-brand-green font-semibold">₹{r.commission.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-right">{r.passengers}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30 font-semibold text-foreground">
                <td className="px-5 py-3">Total</td>
                <td className="px-5 py-3 text-right">{SALES_REPORT.reduce((a, b) => a + b.bookings, 0)}</td>
                <td className="px-5 py-3 text-right">₹{SALES_REPORT.reduce((a, b) => a + b.revenue, 0).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-right text-brand-green">₹{SALES_REPORT.reduce((a, b) => a + b.commission, 0).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-right">{SALES_REPORT.reduce((a, b) => a + b.passengers, 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AgentShell>
  );
}
