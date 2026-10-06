import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AgentShell } from "@/components/AgentShell";
import {
  TicketCheck,
  IndianRupee,
  Percent,
  XCircle,
  Receipt,
  Filter,
  FileText,
  FileSpreadsheet,
  Download,
  TrendingUp,
} from "lucide-react";
import { SourceSummaryGrid, SourceBarComparison } from "@/components/booking-source";
import { errorMessage } from "@/lib/api/client";
import { listMyBookings, myBookingsKey, rupees, shortDate, todayInIndia } from "@/lib/api/booking";
import { daysBefore, summarize } from "@/lib/agent-stats";
import { downloadCsv } from "@/lib/csv";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof TicketCheck;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="rounded-lg bg-brand-green/10 p-2">
          <Icon className="h-4 w-4 text-brand-green" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function BarChart({ data, color = "var(--brand-green)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-40 items-end gap-1.5">
      {data.map((v, i) => (
        <div
          key={i}
          title={String(v)}
          className="flex-1 rounded-t-md transition-all hover:opacity-80"
          style={{
            height: `${Math.max((v / max) * 100, v > 0 ? 4 : 1)}%`,
            background: color,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
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
  const today = todayInIndia();
  const [from, setFrom] = useState(() => daysBefore(today, 13));
  const [to, setTo] = useState(today);
  const [route, setRoute] = useState("ALL");

  const query = useQuery({ queryKey: myBookingsKey, queryFn: listMyBookings });
  const all = useMemo(() => query.data ?? [], [query.data]);
  const routeNames = useMemo(
    () =>
      [...new Set(all.map((b) => `${b.trip.route.origin} → ${b.trip.route.destination}`))].sort(),
    [all],
  );
  const report = useMemo(() => {
    const rows =
      route === "ALL"
        ? all
        : all.filter((b) => `${b.trip.route.origin} → ${b.trip.route.destination}` === route);
    return summarize(rows, from <= to ? from : to, to);
  }, [all, from, to, route]);

  const daily = report.daily;
  const span = `${daily.length} day${daily.length === 1 ? "" : "s"}`;
  const topTickets = Math.max(...report.routes.map((r) => r.tickets), 1);
  const exportCsv = () =>
    downloadCsv(
      `my-sales_${from}_to_${to}.csv`,
      ["Date", "Bookings", "Cancelled", "Revenue", "Commission"],
      daily.map((d) => [d.date, d.bookings, d.cancelled, d.revenue, d.commission]),
    );

  return (
    <AgentShell title="Reports & Analytics">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm print:hidden">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-brand-green" /> Filters
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground">From</label>
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => e.target.value && setFrom(e.target.value)}
            className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground">To</label>
          <input
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={(e) => e.target.value && setTo(e.target.value)}
            className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground">Route</label>
          <select
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            className="mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="ALL">All Routes</option>
            {routeNames.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={exportCsv}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            <FileSpreadsheet className="h-4 w-4" /> CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            <FileText className="h-4 w-4" /> PDF
          </button>
        </div>
      </div>

      {query.isError && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
          Could not load your bookings: {errorMessage(query.error)}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Total Bookings"
          value={query.isPending ? "—" : String(report.bookings)}
          icon={TicketCheck}
        />
        <StatCard
          label="Total Revenue"
          value={query.isPending ? "—" : rupees(report.revenue)}
          icon={IndianRupee}
        />
        <StatCard
          label="Total Commission"
          value={query.isPending ? "—" : rupees(report.commission)}
          icon={Percent}
        />
        <StatCard
          label="Cancelled Tickets"
          value={query.isPending ? "—" : String(report.cancelled)}
          icon={XCircle}
        />
        <StatCard
          label="Avg Ticket Value"
          value={query.isPending ? "—" : rupees(report.averageFare)}
          icon={Receipt}
        />
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Daily Bookings Trend" subtitle={`Tickets sold per day, ${span}`}>
          <BarChart data={daily.map((d) => d.bookings)} />
        </ChartCard>
        <ChartCard title="Revenue Trend" subtitle={`Rupees per day, ${span}`}>
          <BarChart data={daily.map((d) => d.revenue)} color="#3b82f6" />
        </ChartCard>
        <ChartCard title="Commission Trend" subtitle={`Rupees earned per day, ${span}`}>
          <BarChart data={daily.map((d) => d.commission)} color="#1e3a8a" />
        </ChartCard>
        <ChartCard title="Route Performance" subtitle="Tickets sold per route">
          <div className="space-y-3">
            {report.routes.length === 0 && (
              <p className="text-sm text-muted-foreground">No tickets sold in this period.</p>
            )}
            {report.routes.slice(0, 5).map((r) => (
              <div key={r.route}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{r.route}</span>
                  <span className="text-muted-foreground">{r.tickets} tickets</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand-green"
                    style={{ width: `${(r.tickets / topTickets) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SourceBarComparison
          title="Revenue by Booking Source"
          subtitle="How the money came in"
          stats={report.sources}
        />
        <SourceBarComparison
          title="Bookings by Source"
          subtitle="How the tickets were sold"
          metric="Bookings"
          pick="count"
          stats={report.sources}
          formatter={(v) => String(v)}
        />
      </div>
      <div className="mb-6">
        <SourceSummaryGrid title="Booking Source Analytics" stats={report.sources} />
      </div>

      {/* Top Routes Table */}
      <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="text-sm font-semibold text-foreground">Top Performing Routes</div>
          <div className="text-xs text-muted-foreground">
            Your highest ticket volume in the selected period
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Route</th>
                <th className="px-5 py-3 text-right font-medium">Tickets Sold</th>
                <th className="px-5 py-3 text-right font-medium">Revenue</th>
                <th className="px-5 py-3 text-left font-medium">Share of Your Sales</th>
              </tr>
            </thead>
            <tbody>
              {report.routes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-muted-foreground">
                    No tickets sold in this period.
                  </td>
                </tr>
              )}
              {report.routes.map((r) => {
                const share = Math.round((r.tickets / (report.bookings || 1)) * 100);
                return (
                  <tr key={r.route} className="border-t border-border">
                    <td className="px-5 py-3 font-medium text-foreground">{r.route}</td>
                    <td className="px-5 py-3 text-right">{r.tickets}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">
                      {rupees(r.revenue)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-brand-green"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground">{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Report */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Daily Sales Report</div>
            <div className="text-xs text-muted-foreground">
              Day-wise breakdown of bookings & commission
            </div>
          </div>
          <button
            onClick={exportCsv}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-muted print:hidden"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Bookings</th>
                <th className="px-5 py-3 text-right font-medium">Cancelled</th>
                <th className="px-5 py-3 text-right font-medium">Revenue</th>
                <th className="px-5 py-3 text-right font-medium">Commission</th>
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((d) => (
                <tr key={d.date} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-foreground">
                    {shortDate(`${d.date}T12:00:00+05:30`)}
                  </td>
                  <td className="px-5 py-3 text-right">{d.bookings}</td>
                  <td className="px-5 py-3 text-right">{d.cancelled}</td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground">
                    {rupees(d.revenue)}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-brand-green">
                    {rupees(d.commission)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30 font-semibold text-foreground">
                <td className="px-5 py-3">Total</td>
                <td className="px-5 py-3 text-right">{report.bookings}</td>
                <td className="px-5 py-3 text-right">{report.cancelled}</td>
                <td className="px-5 py-3 text-right">{rupees(report.revenue)}</td>
                <td className="px-5 py-3 text-right text-brand-green">
                  {rupees(report.commission)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AgentShell>
  );
}
