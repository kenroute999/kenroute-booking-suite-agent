import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AgentShell } from "@/components/AgentShell";
import {
  Wallet,
  TrendingUp,
  Calendar,
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Filter,
  Download,
  IndianRupee,
} from "lucide-react";

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
});

type TxnType = "Credit" | "Debit";

type Transaction = {
  id: string;
  date: string;
  bookingId: string;
  commission: number;
  type: TxnType;
  balance: number;
  note: string;
};

const TRANSACTIONS: Transaction[] = [
  { id: "TXN90021", date: "31 May 2026, 10:42 AM", bookingId: "BK20451", commission: 145, type: "Credit", balance: 12450, note: "Booking commission" },
  { id: "TXN90020", date: "31 May 2026, 09:15 AM", bookingId: "BK20450", commission: 130, type: "Credit", balance: 12305, note: "Booking commission" },
  { id: "TXN90019", date: "30 May 2026, 06:20 PM", bookingId: "—", commission: 5000, type: "Debit", balance: 12175, note: "Withdrawal to HDFC ****4521" },
  { id: "TXN90018", date: "30 May 2026, 02:10 PM", bookingId: "BK20449", commission: 165, type: "Credit", balance: 17175, note: "Booking commission" },
  { id: "TXN90017", date: "30 May 2026, 12:55 PM", bookingId: "BK20448", commission: 120, type: "Credit", balance: 17010, note: "Booking commission" },
  { id: "TXN90016", date: "29 May 2026, 08:32 PM", bookingId: "BK20447", commission: 145, type: "Credit", balance: 16890, note: "Booking commission" },
  { id: "TXN90015", date: "29 May 2026, 05:11 PM", bookingId: "BK20446", commission: 290, type: "Credit", balance: 16745, note: "Booking commission" },
  { id: "TXN90014", date: "29 May 2026, 10:00 AM", bookingId: "BK20445", commission: 145, type: "Credit", balance: 16455, note: "Booking commission" },
  { id: "TXN90013", date: "28 May 2026, 07:42 PM", bookingId: "BK20444", commission: 165, type: "Credit", balance: 16310, note: "Booking commission" },
  { id: "TXN90012", date: "28 May 2026, 03:25 PM", bookingId: "BK20443", commission: 130, type: "Credit", balance: 16145, note: "Booking commission" },
];

const PAYOUTS = [
  { id: "PO5021", date: "30 May 2026", amount: 5000, status: "Completed" as const, account: "HDFC ****4521" },
  { id: "PO5020", date: "23 May 2026", amount: 8500, status: "Completed" as const, account: "HDFC ****4521" },
  { id: "PO5019", date: "16 May 2026", amount: 6200, status: "Processing" as const, account: "HDFC ****4521" },
  { id: "PO5018", date: "09 May 2026", amount: 4800, status: "Completed" as const, account: "HDFC ****4521" },
  { id: "PO5017", date: "02 May 2026", amount: 3500, status: "Failed" as const, account: "HDFC ****4521" },
];

const DAILY = [
  { d: "Mon", v: 2400 },
  { d: "Tue", v: 3100 },
  { d: "Wed", v: 2800 },
  { d: "Thu", v: 4200 },
  { d: "Fri", v: 3800 },
  { d: "Sat", v: 5100 },
  { d: "Sun", v: 4230 },
];

const MONTHLY = [
  { m: "Dec", v: 68000 },
  { m: "Jan", v: 74200 },
  { m: "Feb", v: 81500 },
  { m: "Mar", v: 92400 },
  { m: "Apr", v: 88600 },
  { m: "May", v: 108420 },
];

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "green" | "blue" | "amber" | "violet";
}) {
  const tones: Record<string, string> = {
    default: "bg-muted text-foreground",
    green: "bg-brand-green/10 text-brand-green",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-bold text-foreground">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function DailyChart() {
  const max = Math.max(...DAILY.map((d) => d.v));
  return (
    <div className="flex h-44 items-end gap-3 px-2">
      {DAILY.map((d) => {
        const h = (d.v / max) * 100;
        return (
          <div key={d.d} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-brand-green to-emerald-400 transition-all"
                style={{ height: `${h}%` }}
                title={`₹${d.v}`}
              />
            </div>
            <div className="text-[11px] font-medium text-muted-foreground">{d.d}</div>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyLine() {
  const max = Math.max(...MONTHLY.map((m) => m.v));
  const min = Math.min(...MONTHLY.map((m) => m.v));
  const W = 360;
  const H = 140;
  const pad = 12;
  const step = (W - pad * 2) / (MONTHLY.length - 1);
  const points = MONTHLY.map((m, i) => {
    const x = pad + i * step;
    const y = H - pad - ((m.v - min) / (max - min || 1)) * (H - pad * 2);
    return [x, y] as const;
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${path} L${points[points.length - 1][0]},${H - pad} L${points[0][0]},${H - pad} Z`;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full">
        <defs>
          <linearGradient id="walletArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--brand-green))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--brand-green))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#walletArea)" />
        <path d={path} fill="none" stroke="hsl(var(--brand-green))" strokeWidth="2.5" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="white" stroke="hsl(var(--brand-green))" strokeWidth="2" />
        ))}
      </svg>
      <div className="flex justify-between px-3 text-[11px] font-medium text-muted-foreground">
        {MONTHLY.map((m) => (
          <span key={m.m}>{m.m}</span>
        ))}
      </div>
    </div>
  );
}

function PayoutStatus({ status }: { status: "Completed" | "Processing" | "Failed" }) {
  if (status === "Completed")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <CheckCircle2 className="h-3 w-3" /> Completed
      </span>
    );
  if (status === "Processing")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
        <Clock className="h-3 w-3" /> Processing
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
      <XCircle className="h-3 w-3" /> Failed
    </span>
  );
}

function WalletPage() {
  const [typeFilter, setTypeFilter] = useState<"All" | TxnType>("All");
  const [range, setRange] = useState("Last 7 days");

  const filtered = useMemo(
    () => (typeFilter === "All" ? TRANSACTIONS : TRANSACTIONS.filter((t) => t.type === typeFilter)),
    [typeFilter],
  );

  return (
    <AgentShell title="Wallet & Commission">
      <div className="space-y-6">
        {/* Hero balance + stats */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sidebar via-sidebar to-[#0a2540] p-6 text-white shadow-lg lg:col-span-1">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-green/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/60">
                <Wallet className="h-4 w-4" /> Wallet Balance
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <IndianRupee className="h-6 w-6 text-white/70" />
                <span className="text-4xl font-bold">12,450.00</span>
              </div>
              <div className="mt-1 text-xs text-white/60">Available for booking & withdrawal</div>

              <div className="mt-5 flex gap-2">
                <button className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green/90">
                  <ArrowDownToLine className="h-4 w-4" /> Withdraw
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                  <ArrowUpRight className="h-4 w-4" /> Add Funds
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            <StatCard label="Today's Commission" value="₹4,230" hint="28 bookings" icon={TrendingUp} tone="green" />
            <StatCard label="Weekly Commission" value="₹26,890" hint="+12% WoW" icon={Calendar} tone="blue" />
            <StatCard label="Monthly Commission" value="₹1,08,420" hint="May 2026" icon={Banknote} tone="amber" />
            <StatCard label="Total Earnings" value="₹8,42,600" hint="Lifetime" icon={IndianRupee} tone="violet" />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Daily Commission</h3>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
              <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-semibold text-brand-green">
                ₹25,630 total
              </span>
            </div>
            <DailyChart />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Monthly Earnings</h3>
                <p className="text-xs text-muted-foreground">Last 6 months</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                ↑ 22% YoY
              </span>
            </div>
            <MonthlyLine />
          </div>
        </div>

        {/* Withdraw section */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-foreground">Withdraw Funds</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Available Balance</div>
                <div className="mt-1 text-2xl font-bold text-brand-green">₹12,450.00</div>
                <div className="mt-1 text-xs text-muted-foreground">Min. withdrawal ₹500</div>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Linked Bank Account</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-white">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">HDFC Bank</div>
                    <div className="text-xs text-muted-foreground">A/C ****4521 · IFSC HDFC0001234</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  placeholder="Enter amount to withdraw"
                  className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40"
                />
              </div>
              <button className="flex items-center justify-center gap-2 rounded-lg bg-brand-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-green/90">
                <ArrowDownToLine className="h-4 w-4" /> Withdraw Funds
              </button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Funds are usually credited within 2–4 business hours via IMPS / NEFT.
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-foreground">Commission Snapshot</h3>
            <div className="space-y-3">
              {[
                { label: "Pending Settlement", value: "₹3,420", tone: "text-amber-600" },
                { label: "Cleared This Month", value: "₹1,04,000", tone: "text-emerald-600" },
                { label: "Avg per Booking", value: "₹151", tone: "text-blue-600" },
                { label: "Top Day", value: "Sat · ₹5,100", tone: "text-violet-600" },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2.5"
                >
                  <span className="text-xs font-medium text-muted-foreground">{r.label}</span>
                  <span className={`text-sm font-bold ${r.tone}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Transactions</h3>
              <p className="text-xs text-muted-foreground">All commission credits & debits</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="bg-transparent text-xs font-medium text-foreground focus:outline-none"
                >
                  <option>Today</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>This month</option>
                </select>
              </div>
              {(["All", "Credit", "Debit"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
                    typeFilter === t
                      ? "bg-brand-green text-white ring-brand-green"
                      : "bg-card text-muted-foreground ring-border hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
              <button className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Transaction ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Booking ID</th>
                  <th className="px-5 py-3">Note</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-center">Type</th>
                  <th className="px-5 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-foreground">{t.id}</td>
                    <td className="px-5 py-3 text-foreground">{t.date}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{t.bookingId}</td>
                    <td className="px-5 py-3 text-muted-foreground">{t.note}</td>
                    <td
                      className={`px-5 py-3 text-right font-bold ${
                        t.type === "Credit" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {t.type === "Credit" ? "+" : "−"}₹{t.commission.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                          t.type === "Credit"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-rose-50 text-rose-700 ring-rose-200"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">
                      ₹{t.balance.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent payouts */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Recent Payouts</h3>
              <p className="text-xs text-muted-foreground">Withdrawals to your linked bank account</p>
            </div>
            <button className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Payout ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Bank Account</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PAYOUTS.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-foreground">{p.id}</td>
                    <td className="px-5 py-3 text-foreground">{p.date}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.account}</td>
                    <td className="px-5 py-3 text-right font-bold text-foreground">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <PayoutStatus status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AgentShell>
  );
}
