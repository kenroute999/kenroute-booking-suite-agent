import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AgentShell } from "@/components/AgentShell";
import {
  Tag,
  Ticket,
  Percent,
  IndianRupee,
  Plus,
  X,
  TrendingUp,
  Copy,
  Pencil,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/offers")({
  component: OffersPage,
});

type OfferStatus = "Active" | "Scheduled" | "Expired" | "Paused";

type Offer = {
  id: string;
  name: string;
  code: string;
  discount: string;
  type: "Percentage" | "Flat";
  start: string;
  end: string;
  used: number;
  limit: number;
  status: OfferStatus;
};

const OFFERS: Offer[] = [
  { id: "OF001", name: "Summer Travel Sale", code: "SUMMER20", discount: "20%", type: "Percentage", start: "01 May 2026", end: "30 Jun 2026", used: 412, limit: 1000, status: "Active" },
  { id: "OF002", name: "First Booking Offer", code: "WELCOME100", discount: "₹100", type: "Flat", start: "01 Jan 2026", end: "31 Dec 2026", used: 1284, limit: 5000, status: "Active" },
  { id: "OF003", name: "Weekend Special", code: "WKND15", discount: "15%", type: "Percentage", start: "01 Jun 2026", end: "31 Aug 2026", used: 86, limit: 500, status: "Active" },
  { id: "OF004", name: "Festive Bonanza", code: "FESTIVE25", discount: "25%", type: "Percentage", start: "15 Jun 2026", end: "30 Jun 2026", used: 0, limit: 2000, status: "Scheduled" },
  { id: "OF005", name: "Monsoon Magic", code: "RAIN50", discount: "₹50", type: "Flat", start: "01 Jul 2026", end: "30 Sep 2026", used: 0, limit: 1500, status: "Scheduled" },
  { id: "OF006", name: "Diwali Special 2025", code: "DIWALI30", discount: "30%", type: "Percentage", start: "20 Oct 2025", end: "05 Nov 2025", used: 892, limit: 1000, status: "Expired" },
  { id: "OF007", name: "Student Discount", code: "STUDENT10", discount: "10%", type: "Percentage", start: "01 Apr 2026", end: "31 Mar 2027", used: 245, limit: 3000, status: "Paused" },
];

const STATS = [
  { label: "Active Offers", value: "3", icon: Tag, sub: "Currently running" },
  { label: "Total Coupons", value: "47", icon: Ticket, sub: "Lifetime created" },
  { label: "Redemption Rate", value: "68%", icon: Percent, sub: "+4.2% this month" },
  { label: "Promotional Revenue", value: "₹2,84,500", icon: IndianRupee, sub: "From offers this month" },
];

const TOP_COUPONS = [
  { code: "WELCOME100", used: 1284, revenue: 184600 },
  { code: "DIWALI30", used: 892, revenue: 142800 },
  { code: "SUMMER20", used: 412, revenue: 98400 },
  { code: "STUDENT10", used: 245, revenue: 42100 },
  { code: "WKND15", used: 86, revenue: 18200 },
];

const REDEMPTION_TREND = [22, 31, 28, 42, 38, 51, 46, 58, 64, 71, 68, 82, 76, 88];

function statusClass(s: OfferStatus) {
  return s === "Active"
    ? "bg-brand-green/15 text-brand-green ring-1 ring-brand-green/30"
    : s === "Scheduled"
    ? "bg-blue-500/15 text-blue-600 ring-1 ring-blue-500/30"
    : s === "Paused"
    ? "bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/30"
    : "bg-muted text-muted-foreground ring-1 ring-border";
}

function OfferDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="flex w-full max-w-md flex-col bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-base font-semibold text-foreground">Create New Offer</div>
            <div className="text-xs text-muted-foreground">Configure a new promotional coupon</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Offer Name</label>
            <input className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm" placeholder="e.g. Summer Travel Sale" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Coupon Code</label>
            <input className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-mono uppercase" placeholder="SUMMER20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Discount Type</label>
              <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option>Percentage</option>
                <option>Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Discount Value</label>
              <input className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm" placeholder="20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Start Date</label>
              <input type="date" className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">End Date</label>
              <input type="date" className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Usage Limit</label>
            <input type="number" className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm" placeholder="1000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Status</label>
            <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option>Active</option>
              <option>Scheduled</option>
              <option>Paused</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 border-t border-border p-4">
          <button onClick={onClose} className="flex-1 h-10 rounded-md border border-input bg-background text-sm font-medium hover:bg-muted">Cancel</button>
          <button className="flex-1 h-10 rounded-md bg-brand-green text-sm font-semibold text-white hover:opacity-90">Create Offer</button>
        </div>
      </div>
    </div>
  );
}

function OffersPage() {
  const [open, setOpen] = useState(false);
  const max = Math.max(...REDEMPTION_TREND);

  return (
    <AgentShell title="Offers & Promotions">
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</div>
                <div className="rounded-lg bg-brand-green/10 p-2"><Icon className="h-4 w-4 text-brand-green" /></div>
              </div>
              <div className="mt-3 text-2xl font-bold text-foreground">{s.value}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Promotions Table */}
      <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-foreground">All Promotions</div>
            <div className="text-xs text-muted-foreground">Manage your coupon codes and offers</div>
          </div>
          <button onClick={() => setOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-brand-green px-3 text-sm font-semibold text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> Create Offer
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Offer Name</th>
                <th className="px-5 py-3 text-left font-medium">Coupon Code</th>
                <th className="px-5 py-3 text-left font-medium">Discount</th>
                <th className="px-5 py-3 text-left font-medium">Start</th>
                <th className="px-5 py-3 text-left font-medium">End</th>
                <th className="px-5 py-3 text-left font-medium">Usage</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {OFFERS.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground">{o.name}</div>
                    <div className="text-[11px] text-muted-foreground">{o.id}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="inline-flex items-center gap-2 rounded-md border border-dashed border-brand-green/40 bg-brand-green/5 px-2 py-1 font-mono text-xs font-semibold text-brand-green">
                      {o.code}
                      <Copy className="h-3 w-3 cursor-pointer" />
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-foreground">{o.discount}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.start}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.end}</td>
                  <td className="px-5 py-3">
                    <div className="text-xs font-medium text-foreground">{o.used} / {o.limit}</div>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-brand-green" style={{ width: `${(o.used / o.limit) * 100}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusClass(o.status)}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Analytics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">Most Used Coupons</div>
              <div className="text-xs text-muted-foreground">Top redeemed coupons by volume</div>
            </div>
            <Ticket className="h-4 w-4 text-brand-green" />
          </div>
          <div className="space-y-3">
            {TOP_COUPONS.map((c) => (
              <div key={c.code}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-foreground">{c.code}</span>
                  <span className="text-muted-foreground">{c.used} uses · ₹{c.revenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand-green" style={{ width: `${(c.used / 1284) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">Redemption Trends</div>
              <div className="text-xs text-muted-foreground">Coupon redemptions, last 14 days</div>
            </div>
            <TrendingUp className="h-4 w-4 text-brand-green" />
          </div>
          <div className="flex h-40 items-end gap-1.5">
            {REDEMPTION_TREND.map((v, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-brand-green/80 transition-all hover:bg-brand-green"
                style={{ height: `${(v / max) * 100}%` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>18 May</span><span>24 May</span><span>31 May</span>
          </div>
        </div>
      </div>

      {open && <OfferDrawer onClose={() => setOpen(false)} />}
    </AgentShell>
  );
}
