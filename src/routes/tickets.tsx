import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AgentShell } from "@/components/AgentShell";
import {
  Search,
  Download,
  FileText,
  Eye,
  Printer,
  XCircle,
  Mail,
  MessageCircle,
  X,
  Ticket,
  TicketCheck,
  Ban,
  RotateCw,
  QrCode,
  MapPin,
  User,
  CreditCard,
  Zap,
  Phone,
  Hash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  SourceBadge,
  SourceBarComparison,
  sourceFor,
  BOOKING_SOURCES,
  type BookingSource,
  type SourceStat,
} from "@/components/booking-source";

export const Route = createFileRoute("/tickets")({
  component: TicketsPage,
});

type TicketStatus = "Active" | "Used" | "Cancelled" | "Reprinted";

type TicketRow = {
  ticketNo: string;
  pnr: string;
  passenger: string;
  gender: "M" | "F";
  mobile: string;
  email: string;
  route: string;
  from: string;
  to: string;
  boarding: string;
  dropping: string;
  seat: string;
  date: string;
  bus: string;
  departure: string;
  arrival: string;
  fare: number;
  status: TicketStatus;
  issuedAt: string;
};

const TICKETS: TicketRow[] = [
  { ticketNo: "TKT784512", pnr: "PNR8842051", passenger: "Ravi Kumar", gender: "M", mobile: "+91 98765 43210", email: "ravi.k@mail.com", route: "Hyderabad → Bangalore", from: "Hyderabad", to: "Bangalore", boarding: "MGBS Bus Stand · 21:30", dropping: "Madiwala · 06:45", seat: "L-12", date: "30 May 2026", bus: "KR-1024", departure: "21:30", arrival: "06:45", fare: 1450, status: "Active", issuedAt: "30 May 2026 · 14:22" },
  { ticketNo: "TKT784511", pnr: "PNR8842050", passenger: "Priya Sharma", gender: "F", mobile: "+91 98220 11234", email: "priya.s@mail.com", route: "Bangalore → Chennai", from: "Bangalore", to: "Chennai", boarding: "Madiwala · 22:00", dropping: "Koyambedu · 05:30", seat: "U-08", date: "30 May 2026", bus: "KR-2218", departure: "22:00", arrival: "05:30", fare: 980, status: "Active", issuedAt: "30 May 2026 · 13:08" },
  { ticketNo: "TKT784510", pnr: "PNR8842049", passenger: "Anand Reddy", gender: "M", mobile: "+91 99887 76655", email: "anand.r@mail.com", route: "Hyderabad → Vijayawada", from: "Hyderabad", to: "Vijayawada", boarding: "LB Nagar · 23:15", dropping: "Benz Circle · 04:45", seat: "L-04", date: "29 May 2026", bus: "KR-3340", departure: "23:15", arrival: "04:45", fare: 650, status: "Used", issuedAt: "29 May 2026 · 18:55" },
  { ticketNo: "TKT784509", pnr: "PNR8842048", passenger: "Meena Iyer", gender: "F", mobile: "+91 90001 22334", email: "meena.i@mail.com", route: "Chennai → Hyderabad", from: "Chennai", to: "Hyderabad", boarding: "Koyambedu · 20:45", dropping: "MGBS · 07:30", seat: "U-15", date: "29 May 2026", bus: "KR-5512", departure: "20:45", arrival: "07:30", fare: 1620, status: "Cancelled", issuedAt: "28 May 2026 · 09:12" },
  { ticketNo: "TKT784508", pnr: "PNR8842047", passenger: "Suresh Babu", gender: "M", mobile: "+91 87654 32109", email: "suresh.b@mail.com", route: "Hyderabad → Bangalore", from: "Hyderabad", to: "Bangalore", boarding: "Miyapur · 22:10", dropping: "Majestic · 07:00", seat: "L-21", date: "28 May 2026", bus: "KR-1024", departure: "22:10", arrival: "07:00", fare: 1450, status: "Reprinted", issuedAt: "28 May 2026 · 11:30" },
  { ticketNo: "TKT784507", pnr: "PNR8842046", passenger: "Kavya Nair", gender: "F", mobile: "+91 70010 99887", email: "kavya.n@mail.com", route: "Bangalore → Mumbai", from: "Bangalore", to: "Mumbai", boarding: "Yeshwantpur · 18:00", dropping: "Dadar · 10:30", seat: "U-02", date: "28 May 2026", bus: "KR-7788", departure: "18:00", arrival: "10:30", fare: 2150, status: "Active", issuedAt: "27 May 2026 · 16:40" },
  { ticketNo: "TKT784506", pnr: "PNR8842045", passenger: "Rahul Verma", gender: "M", mobile: "+91 99112 33445", email: "rahul.v@mail.com", route: "Hyderabad → Bangalore", from: "Hyderabad", to: "Bangalore", boarding: "MGBS Bus Stand · 21:30", dropping: "Madiwala · 06:45", seat: "L-07", date: "30 May 2026", bus: "KR-1024", departure: "21:30", arrival: "06:45", fare: 1450, status: "Active", issuedAt: "30 May 2026 · 10:14" },
  { ticketNo: "TKT784505", pnr: "PNR8842044", passenger: "Divya Pillai", gender: "F", mobile: "+91 88990 11223", email: "divya.p@mail.com", route: "Chennai → Hyderabad", from: "Chennai", to: "Hyderabad", boarding: "Koyambedu · 20:45", dropping: "MGBS · 07:30", seat: "L-18", date: "27 May 2026", bus: "KR-5512", departure: "20:45", arrival: "07:30", fare: 1620, status: "Reprinted", issuedAt: "27 May 2026 · 08:21" },
  { ticketNo: "TKT784504", pnr: "PNR8842043", passenger: "Vinod Singh", gender: "M", mobile: "+91 77665 54433", email: "vinod.s@mail.com", route: "Bangalore → Chennai", from: "Bangalore", to: "Chennai", boarding: "Madiwala · 22:00", dropping: "Koyambedu · 05:30", seat: "U-11", date: "26 May 2026", bus: "KR-2218", departure: "22:00", arrival: "05:30", fare: 980, status: "Cancelled", issuedAt: "26 May 2026 · 12:00" },
  { ticketNo: "TKT784503", pnr: "PNR8842042", passenger: "Lakshmi Devi", gender: "F", mobile: "+91 90909 80808", email: "lakshmi.d@mail.com", route: "Hyderabad → Vijayawada", from: "Hyderabad", to: "Vijayawada", boarding: "LB Nagar · 23:15", dropping: "Benz Circle · 04:45", seat: "L-09", date: "26 May 2026", bus: "KR-3340", departure: "23:15", arrival: "04:45", fare: 650, status: "Used", issuedAt: "25 May 2026 · 19:48" },
];

const PAGE_SIZE = 8;

function StatusPill({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, string> = {
    Active: "bg-brand-green/10 text-brand-green ring-1 ring-brand-green/30",
    Used: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    Cancelled: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    Reprinted: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Ticket;
  tone: "green" | "blue" | "rose" | "amber";
}) {
  const tones = {
    green: "bg-brand-green/10 text-brand-green",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  title,
  tone,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  tone?: "default" | "whatsapp" | "danger" | "primary";
  onClick?: () => void;
}) {
  const tones = {
    default: "text-muted-foreground hover:text-foreground hover:bg-muted",
    whatsapp: "text-emerald-600 hover:bg-emerald-50",
    danger: "text-rose-600 hover:bg-rose-50",
    primary: "text-brand-green hover:bg-brand-green/10",
  };
  return (
    <button
      title={title}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card transition-colors ${tones[tone ?? "default"]}`}
    >
      {children}
    </button>
  );
}

function TicketsPage() {
  const [query, setQuery] = useState("");
  const [searchField, setSearchField] = useState<"all" | "pnr" | "ticket" | "mobile" | "name">("all");
  const [status, setStatus] = useState<"All" | TicketStatus>("All");
  const [sourceFilter, setSourceFilter] = useState<"All" | BookingSource>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<TicketRow | null>(null);
  const [reprintQuery, setReprintQuery] = useState("");
  const [reprintMode, setReprintMode] = useState<"mobile" | "pnr">("mobile");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TICKETS.filter((t) => {
      if (status !== "All" && t.status !== status) return false;
      if (!q) return true;
      const map = {
        all: `${t.ticketNo} ${t.pnr} ${t.passenger} ${t.mobile}`,
        pnr: t.pnr,
        ticket: t.ticketNo,
        mobile: t.mobile,
        name: t.passenger,
      } as const;
      return map[searchField].toLowerCase().includes(q);
    });
  }, [query, searchField, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const active = TICKETS.filter((t) => t.status === "Active").length;
    const today = TICKETS.filter((t) => t.date === "30 May 2026").length;
    const cancelled = TICKETS.filter((t) => t.status === "Cancelled").length;
    const reprinted = TICKETS.filter((t) => t.status === "Reprinted").length;
    return { active, today, cancelled, reprinted };
  }, []);

  const reprintMatch = useMemo(() => {
    const q = reprintQuery.trim().toLowerCase();
    if (!q) return [] as TicketRow[];
    return TICKETS.filter((t) =>
      (reprintMode === "mobile" ? t.mobile : t.pnr).toLowerCase().includes(q),
    ).slice(0, 3);
  }, [reprintQuery, reprintMode]);

  return (
    <AgentShell title="Tickets Management">
      {/* Header strip */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-gradient-to-r from-navy to-navy/90 p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/60">Agent · AGT1024</div>
          <h2 className="mt-1 text-xl font-bold">Tickets &amp; Delivery</h2>
          <p className="text-sm text-white/70">Reprint, resend, and manage every ticket issued through your counter.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
            <FileText className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Tickets" value={String(stats.active)} sub="Valid for travel" icon={TicketCheck} tone="green" />
        <StatCard label="Today's Tickets" value={String(stats.today)} sub="Issued today" icon={Ticket} tone="blue" />
        <StatCard label="Cancelled Tickets" value={String(stats.cancelled)} sub="Refund processed" icon={Ban} tone="rose" />
        <StatCard label="Reprinted Tickets" value={String(stats.reprinted)} sub="Duplicates issued" icon={RotateCw} tone="amber" />
      </div>

      {/* Quick Reprint Widget */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Search Tickets</h3>
              <p className="text-xs text-muted-foreground">Find any ticket by PNR, Ticket No, Mobile or Passenger.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background pl-3 focus-within:ring-2 focus-within:ring-brand-green/40">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Enter PNR, Ticket Number, Mobile or Passenger Name…"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as typeof searchField)}
                className="h-11 border-l border-border bg-transparent px-3 text-sm font-medium text-foreground outline-none"
              >
                <option value="all">All Fields</option>
                <option value="pnr">PNR</option>
                <option value="ticket">Ticket No</option>
                <option value="mobile">Mobile</option>
                <option value="name">Passenger</option>
              </select>
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as typeof status);
                setPage(1);
              }}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-brand-green/40"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Used">Used</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Reprinted">Reprinted</option>
            </select>
          </div>
        </div>

        {/* Quick reprint */}
        <div className="rounded-2xl border border-brand-green/30 bg-gradient-to-br from-brand-green/5 to-emerald-50/40 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green text-white">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Quick Reprint</h3>
              <p className="text-[11px] text-muted-foreground">Find &amp; reprint in one click</p>
            </div>
          </div>

          <div className="mb-2 inline-flex rounded-lg border border-border bg-background p-0.5 text-xs font-semibold">
            <button
              onClick={() => setReprintMode("mobile")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${
                reprintMode === "mobile" ? "bg-navy text-white" : "text-muted-foreground"
              }`}
            >
              <Phone className="h-3 w-3" /> Mobile
            </button>
            <button
              onClick={() => setReprintMode("pnr")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${
                reprintMode === "pnr" ? "bg-navy text-white" : "text-muted-foreground"
              }`}
            >
              <Hash className="h-3 w-3" /> PNR
            </button>
          </div>

          <input
            value={reprintQuery}
            onChange={(e) => setReprintQuery(e.target.value)}
            placeholder={reprintMode === "mobile" ? "+91 98xxx xxxxx" : "PNR8842xxx"}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-brand-green/40"
          />

          <div className="mt-3 space-y-2">
            {reprintMatch.length === 0 && reprintQuery && (
              <div className="rounded-lg border border-dashed border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                No matching tickets.
              </div>
            )}
            {reprintMatch.map((t) => (
              <div
                key={t.ticketNo}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-foreground">{t.passenger}</div>
                  <div className="truncate text-[10px] text-muted-foreground">
                    {t.ticketNo} · {t.seat} · {t.date}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(t)}
                  className="inline-flex h-7 items-center gap-1 rounded-md bg-brand-green px-2.5 text-[11px] font-bold text-white hover:bg-brand-green/90"
                >
                  <Printer className="h-3 w-3" /> Reprint
                </button>
              </div>
            ))}
            {!reprintQuery && (
              <div className="text-[11px] text-muted-foreground">
                Tip: paste a mobile number or PNR to instantly fetch &amp; reprint.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">All Tickets</h3>
            <p className="text-xs text-muted-foreground">
              Showing {paged.length} of {filtered.length} tickets
            </p>
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            Page {currentPage} / {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Ticket No</th>
                <th className="px-3 py-3 font-semibold">PNR</th>
                <th className="px-3 py-3 font-semibold">Passenger</th>
                <th className="px-3 py-3 font-semibold">Mobile</th>
                <th className="px-3 py-3 font-semibold">Route</th>
                <th className="px-3 py-3 font-semibold">Seat</th>
                <th className="px-3 py-3 font-semibold">Journey</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((t) => (
                <tr key={t.ticketNo} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <button
                      onClick={() => setSelected(t)}
                      className="font-mono text-[12px] font-bold text-brand-green hover:underline"
                    >
                      {t.ticketNo}
                    </button>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">Issued {t.issuedAt}</div>
                  </td>
                  <td className="px-3 py-3 font-mono text-[12px] font-semibold text-foreground">{t.pnr}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                          t.gender === "M" ? "bg-blue-500" : "bg-pink-500"
                        }`}
                      >
                        {t.passenger.charAt(0)}
                      </div>
                      <div className="font-medium text-foreground">{t.passenger}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{t.mobile}</td>
                  <td className="px-3 py-3 font-medium text-foreground">{t.route}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-[12px] font-semibold text-foreground">
                      {t.seat}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {t.date}
                    <div className="text-[10px]">{t.departure} → {t.arrival}</div>
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill status={t.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn title="View Ticket" tone="primary" onClick={() => setSelected(t)}>
                        <Eye className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Reprint">
                        <Printer className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Download PDF">
                        <Download className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Share via WhatsApp" tone="whatsapp">
                        <MessageCircle className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Send via Email">
                        <Mail className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Cancel Ticket" tone="danger">
                        <XCircle className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-sm text-muted-foreground">
                    No tickets match the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <div className="text-xs text-muted-foreground">
            {filtered.length} tickets · {PAGE_SIZE} per page
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-8 min-w-8 rounded-md px-2.5 text-xs font-semibold ${
                    n === currentPage
                      ? "bg-brand-green text-white"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {selected && <TicketDrawer ticket={selected} onClose={() => setSelected(null)} />}
    </AgentShell>
  );
}

function TicketDrawer({ ticket, onClose }: { ticket: TicketRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-navy px-5 py-4 text-white">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/60">E-Ticket</div>
            <div className="font-mono text-sm font-semibold">{ticket.ticketNo}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* E-Ticket */}
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-md">
            <div className="flex items-center justify-between bg-gradient-to-r from-navy to-navy/90 px-5 py-4 text-white">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/60">KenRoute</div>
                <div className="text-lg font-black tracking-tight">E-TICKET</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-white/60">PNR</div>
                <div className="font-mono text-sm font-bold">{ticket.pnr}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-5 py-4">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">From</div>
                <div className="text-base font-bold text-foreground">{ticket.from}</div>
                <div className="text-[11px] text-muted-foreground">{ticket.departure}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-muted-foreground">To</div>
                <div className="text-base font-bold text-foreground">{ticket.to}</div>
                <div className="text-[11px] text-muted-foreground">{ticket.arrival}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-y border-dashed border-border bg-muted/30 px-5 py-3">
              <div>
                <div className="text-[9px] uppercase text-muted-foreground">Bus</div>
                <div className="text-sm font-bold text-foreground">{ticket.bus}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase text-muted-foreground">Date</div>
                <div className="text-sm font-bold text-foreground">{ticket.date}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase text-muted-foreground">Seat</div>
                <div className="font-mono text-sm font-bold text-brand-green">{ticket.seat}</div>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Passenger</div>
                <div className="text-sm font-bold text-foreground">{ticket.passenger}</div>
                <div className="text-[11px] text-muted-foreground">{ticket.mobile}</div>
              </div>
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-border bg-white">
                <QrCode className="h-20 w-20 text-navy" />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-dashed border-border bg-muted/30 px-5 py-3">
              <div className="text-[10px] uppercase text-muted-foreground">Fare</div>
              <div className="text-lg font-black text-foreground">
                ₹{ticket.fare.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <Section title="Passenger Details" icon={<User className="h-4 w-4" />}>
            <Row label="Name" value={ticket.passenger} />
            <Row label="Mobile" value={ticket.mobile} />
            <Row label="Email" value={ticket.email} />
          </Section>

          <Section title="Route Information" icon={<MapPin className="h-4 w-4" />}>
            <Row label="Route" value={ticket.route} />
            <Row label="Boarding" value={ticket.boarding} />
            <Row label="Dropping" value={ticket.dropping} />
          </Section>

          <Section title="Status & Fare" icon={<CreditCard className="h-4 w-4" />}>
            <Row label="PNR" value={ticket.pnr} />
            <Row label="Fare" value={`₹${ticket.fare.toLocaleString("en-IN")}`} />
            <Row label="Ticket Status" value={<StatusPill status={ticket.status} />} />
          </Section>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border bg-card p-4">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-green/90">
            <Printer className="h-4 w-4" />
            Reprint
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
            <Mail className="h-4 w-4" />
            Email
          </button>
        </div>
      </aside>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground">{value}</div>
    </div>
  );
}
