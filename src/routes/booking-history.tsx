import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AgentShell } from "@/components/AgentShell";
import {
  Search,
  Filter,
  Download,
  FileText,
  Eye,
  Printer,
  XCircle,
  Phone,
  ChevronLeft,
  ChevronRight,
  X,
  TicketCheck,
  Ticket,
  Ban,
  IndianRupee,
  QrCode,
  MapPin,
  Calendar,
  User,
  CreditCard,
  MoreHorizontal,
} from "lucide-react";
import {
  SourceBadge,
  SourceBarComparison,
  sourceFor,
  BOOKING_SOURCES,
  type BookingSource,
  type SourceStat,
} from "@/components/booking-source";

export const Route = createFileRoute("/booking-history")({
  component: BookingHistoryPage,
});

type BookingStatus = "Confirmed" | "Cancelled" | "Pending" | "Completed";
type PaymentStatus = "Paid" | "Refunded" | "Pending" | "Failed";

type Booking = {
  id: string;
  ticketNo: string;
  passenger: string;
  gender: "M" | "F";
  mobile: string;
  route: string;
  from: string;
  to: string;
  boarding: string;
  dropping: string;
  seat: string;
  date: string;
  bus: string;
  departure: string;
  amount: number;
  payment: PaymentStatus;
  status: BookingStatus;
};

const ROUTES = [
  "All Routes",
  "Hyderabad → Bangalore",
  "Bangalore → Chennai",
  "Hyderabad → Vijayawada",
  "Chennai → Hyderabad",
  "Bangalore → Mumbai",
];

const BOOKINGS: Booking[] = [
  { id: "KR-2026-10481", ticketNo: "TKT784512", passenger: "Ravi Kumar", gender: "M", mobile: "+91 98765 43210", route: "Hyderabad → Bangalore", from: "Hyderabad", to: "Bangalore", boarding: "MGBS Bus Stand · 21:30", dropping: "Madiwala · 06:45", seat: "L-12", date: "30 May 2026", bus: "KR-1024", departure: "21:30", amount: 1450, payment: "Paid", status: "Confirmed" },
  { id: "KR-2026-10480", ticketNo: "TKT784511", passenger: "Priya Sharma", gender: "F", mobile: "+91 98220 11234", route: "Bangalore → Chennai", from: "Bangalore", to: "Chennai", boarding: "Madiwala · 22:00", dropping: "Koyambedu · 05:30", seat: "U-08", date: "30 May 2026", bus: "KR-2218", departure: "22:00", amount: 980, payment: "Paid", status: "Confirmed" },
  { id: "KR-2026-10479", ticketNo: "TKT784510", passenger: "Anand Reddy", gender: "M", mobile: "+91 99887 76655", route: "Hyderabad → Vijayawada", from: "Hyderabad", to: "Vijayawada", boarding: "LB Nagar · 23:15", dropping: "Benz Circle · 04:45", seat: "L-04", date: "29 May 2026", bus: "KR-3340", departure: "23:15", amount: 650, payment: "Paid", status: "Completed" },
  { id: "KR-2026-10478", ticketNo: "TKT784509", passenger: "Meena Iyer", gender: "F", mobile: "+91 90001 22334", route: "Chennai → Hyderabad", from: "Chennai", to: "Hyderabad", boarding: "Koyambedu · 20:45", dropping: "MGBS · 07:30", seat: "U-15", date: "29 May 2026", bus: "KR-5512", departure: "20:45", amount: 1620, payment: "Refunded", status: "Cancelled" },
  { id: "KR-2026-10477", ticketNo: "TKT784508", passenger: "Suresh Babu", gender: "M", mobile: "+91 87654 32109", route: "Hyderabad → Bangalore", from: "Hyderabad", to: "Bangalore", boarding: "Miyapur · 22:10", dropping: "Majestic · 07:00", seat: "L-21", date: "28 May 2026", bus: "KR-1024", departure: "22:10", amount: 1450, payment: "Paid", status: "Completed" },
  { id: "KR-2026-10476", ticketNo: "TKT784507", passenger: "Kavya Nair", gender: "F", mobile: "+91 70010 99887", route: "Bangalore → Mumbai", from: "Bangalore", to: "Mumbai", boarding: "Yeshwantpur · 18:00", dropping: "Dadar · 10:30", seat: "U-02", date: "28 May 2026", bus: "KR-7788", departure: "18:00", amount: 2150, payment: "Paid", status: "Confirmed" },
  { id: "KR-2026-10475", ticketNo: "TKT784506", passenger: "Rahul Verma", gender: "M", mobile: "+91 99112 33445", route: "Hyderabad → Bangalore", from: "Hyderabad", to: "Bangalore", boarding: "MGBS Bus Stand · 21:30", dropping: "Madiwala · 06:45", seat: "L-07", date: "27 May 2026", bus: "KR-1024", departure: "21:30", amount: 1450, payment: "Pending", status: "Pending" },
  { id: "KR-2026-10474", ticketNo: "TKT784505", passenger: "Divya Pillai", gender: "F", mobile: "+91 88990 11223", route: "Chennai → Hyderabad", from: "Chennai", to: "Hyderabad", boarding: "Koyambedu · 20:45", dropping: "MGBS · 07:30", seat: "L-18", date: "27 May 2026", bus: "KR-5512", departure: "20:45", amount: 1620, payment: "Paid", status: "Completed" },
  { id: "KR-2026-10473", ticketNo: "TKT784504", passenger: "Vinod Singh", gender: "M", mobile: "+91 77665 54433", route: "Bangalore → Chennai", from: "Bangalore", to: "Chennai", boarding: "Madiwala · 22:00", dropping: "Koyambedu · 05:30", seat: "U-11", date: "26 May 2026", bus: "KR-2218", departure: "22:00", amount: 980, payment: "Refunded", status: "Cancelled" },
  { id: "KR-2026-10472", ticketNo: "TKT784503", passenger: "Lakshmi Devi", gender: "F", mobile: "+91 90909 80808", route: "Hyderabad → Vijayawada", from: "Hyderabad", to: "Vijayawada", boarding: "LB Nagar · 23:15", dropping: "Benz Circle · 04:45", seat: "L-09", date: "26 May 2026", bus: "KR-3340", departure: "23:15", amount: 650, payment: "Paid", status: "Completed" },
  { id: "KR-2026-10471", ticketNo: "TKT784502", passenger: "Arjun Mehta", gender: "M", mobile: "+91 81234 56789", route: "Bangalore → Mumbai", from: "Bangalore", to: "Mumbai", boarding: "Yeshwantpur · 18:00", dropping: "Dadar · 10:30", seat: "U-19", date: "25 May 2026", bus: "KR-7788", departure: "18:00", amount: 2150, payment: "Paid", status: "Completed" },
  { id: "KR-2026-10470", ticketNo: "TKT784501", passenger: "Sneha Reddy", gender: "F", mobile: "+91 98123 45670", route: "Hyderabad → Bangalore", from: "Hyderabad", to: "Bangalore", boarding: "Miyapur · 22:10", dropping: "Majestic · 07:00", seat: "L-03", date: "25 May 2026", bus: "KR-1024", departure: "22:10", amount: 1450, payment: "Paid", status: "Completed" },
];

const PAGE_SIZE = 8;

function StatusPill({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, string> = {
    Confirmed: "bg-brand-green/10 text-brand-green ring-1 ring-brand-green/30",
    Completed: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    Cancelled: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

function PaymentPill({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, string> = {
    Paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    Refunded: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Failed: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
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
  tone: "green" | "blue" | "rose" | "navy";
}) {
  const tones = {
    green: "bg-brand-green/10 text-brand-green",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    navy: "bg-navy/10 text-navy",
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

function BookingHistoryPage() {
  const [query, setQuery] = useState("");
  const [searchField, setSearchField] = useState<"all" | "id" | "name" | "mobile" | "ticket">("all");
  const [route, setRoute] = useState("All Routes");
  const [date, setDate] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"All" | BookingStatus>("All");
  const [paymentStatus, setPaymentStatus] = useState<"All" | PaymentStatus>("All");
  const [sourceFilter, setSourceFilter] = useState<"All" | BookingSource>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BOOKINGS.filter((b) => {
      if (route !== "All Routes" && b.route !== route) return false;
      if (bookingStatus !== "All" && b.status !== bookingStatus) return false;
      if (paymentStatus !== "All" && b.payment !== paymentStatus) return false;
      if (sourceFilter !== "All" && sourceFor(b.id) !== sourceFilter) return false;
      if (date && b.date !== date) return false;
      if (!q) return true;
      const fields: Record<typeof searchField, string> = {
        all: `${b.id} ${b.passenger} ${b.mobile} ${b.ticketNo}`,
        id: b.id,
        name: b.passenger,
        mobile: b.mobile,
        ticket: b.ticketNo,
      };
      return fields[searchField].toLowerCase().includes(q);
    });
  }, [query, searchField, route, date, bookingStatus, paymentStatus, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totals = useMemo(() => {
    const confirmed = BOOKINGS.filter((b) => b.status === "Confirmed" || b.status === "Completed").length;
    const cancelled = BOOKINGS.filter((b) => b.status === "Cancelled").length;
    const revenue = BOOKINGS.filter((b) => b.payment === "Paid").reduce((s, b) => s + b.amount, 0);
    return { total: BOOKINGS.length, confirmed, cancelled, revenue };
  }, []);

  const sourceStats: SourceStat[] = useMemo(() => {
    return BOOKING_SOURCES.map((src) => {
      const rows = BOOKINGS.filter((b) => sourceFor(b.id) === src);
      return {
        source: src,
        count: rows.length,
        revenue: rows.filter((b) => b.payment === "Paid").reduce((s, b) => s + b.amount, 0),
      };
    });
  }, []);

  return (
    <AgentShell title="Booking History">
      {/* Header strip */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-gradient-to-r from-navy to-navy/90 p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/60">Agent · AGT1024</div>
          <h2 className="mt-1 text-xl font-bold">All Bookings &amp; Tickets</h2>
          <p className="text-sm text-white/70">Search, track, reprint and manage every ticket you've issued.</p>
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
        <StatCard label="Total Bookings" value={String(totals.total)} sub="All time" icon={Ticket} tone="navy" />
        <StatCard label="Confirmed Tickets" value={String(totals.confirmed)} sub="Active + completed" icon={TicketCheck} tone="green" />
        <StatCard label="Cancelled Tickets" value={String(totals.cancelled)} sub="Refund processed" icon={Ban} tone="rose" />
        <StatCard label="Revenue Generated" value={`₹${totals.revenue.toLocaleString("en-IN")}`} sub="Paid bookings" icon={IndianRupee} tone="blue" />
      </div>

      {/* Search + Filters */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background pl-3 focus-within:ring-2 focus-within:ring-brand-green/40">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Booking ID, Passenger, Mobile or Ticket Number…"
              className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as typeof searchField)}
              className="h-11 border-l border-border bg-transparent px-3 text-sm font-medium text-foreground outline-none"
            >
              <option value="all">All Fields</option>
              <option value="id">Booking ID</option>
              <option value="name">Passenger Name</option>
              <option value="mobile">Mobile Number</option>
              <option value="ticket">Ticket Number</option>
            </select>
          </div>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-green px-5 text-sm font-semibold text-white shadow-sm hover:bg-brand-green/90">
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Route" value={route} onChange={(v) => { setRoute(v); setPage(1); }} options={ROUTES} icon={<Filter className="h-3.5 w-3.5" />} />
          <FilterInput label="Journey Date" type="text" value={date} onChange={(v) => { setDate(v); setPage(1); }} placeholder="e.g. 30 May 2026" icon={<Calendar className="h-3.5 w-3.5" />} />
          <FilterSelect label="Booking Status" value={bookingStatus} onChange={(v) => { setBookingStatus(v as typeof bookingStatus); setPage(1); }} options={["All", "Confirmed", "Completed", "Cancelled", "Pending"]} icon={<TicketCheck className="h-3.5 w-3.5" />} />
          <FilterSelect label="Payment Status" value={paymentStatus} onChange={(v) => { setPaymentStatus(v as typeof paymentStatus); setPage(1); }} options={["All", "Paid", "Refunded", "Pending", "Failed"]} icon={<CreditCard className="h-3.5 w-3.5" />} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Bookings</h3>
            <p className="text-xs text-muted-foreground">
              Showing {paged.length} of {filtered.length} results
            </p>
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            Page {currentPage} / {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Booking ID</th>
                <th className="px-3 py-3 font-semibold">Passenger</th>
                <th className="px-3 py-3 font-semibold">Mobile</th>
                <th className="px-3 py-3 font-semibold">Route</th>
                <th className="px-3 py-3 font-semibold">Boarding</th>
                <th className="px-3 py-3 font-semibold">Seat</th>
                <th className="px-3 py-3 font-semibold">Journey</th>
                <th className="px-3 py-3 font-semibold text-right">Amount</th>
                <th className="px-3 py-3 font-semibold">Payment</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-5 py-3">
                    <button
                      onClick={() => setSelected(b)}
                      className="font-mono text-[12px] font-semibold text-brand-green hover:underline"
                    >
                      {b.id}
                    </button>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {b.ticketNo}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                          b.gender === "M" ? "bg-blue-500" : "bg-pink-500"
                        }`}
                      >
                        {b.passenger.charAt(0)}
                      </div>
                      <div className="font-medium text-foreground">{b.passenger}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{b.mobile}</td>
                  <td className="px-3 py-3 font-medium text-foreground">{b.route}</td>
                  <td className="px-3 py-3 text-muted-foreground">{b.boarding}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-[12px] font-semibold text-foreground">
                      {b.seat}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{b.date}</td>
                  <td className="px-3 py-3 text-right font-semibold text-foreground">
                    ₹{b.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-3">
                    <PaymentPill status={b.payment} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill status={b.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn title="View Ticket" onClick={() => setSelected(b)}>
                        <Eye className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Reprint Ticket">
                        <Printer className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Download PDF">
                        <Download className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Contact Passenger">
                        <Phone className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Cancel Booking" danger>
                        <XCircle className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-5 py-16 text-center text-sm text-muted-foreground">
                    No bookings match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <div className="text-xs text-muted-foreground">
            {filtered.length} bookings · 8 per page
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

      {/* Drawer */}
      {selected && <BookingDrawer booking={selected} onClose={() => setSelected(null)} />}
    </AgentShell>
  );
}

function IconBtn({
  children,
  title,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted ${
        danger ? "hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600" : "hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-green/40"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type ?? "text"}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-green/40"
      />
    </div>
  );
}

function BookingDrawer({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-navy px-5 py-4 text-white">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/60">Booking Details</div>
            <div className="font-mono text-sm font-semibold">{booking.id}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Ticket preview */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between bg-gradient-to-r from-brand-green to-emerald-600 px-5 py-3 text-white">
              <div>
                <div className="text-[10px] uppercase tracking-widest opacity-80">KenRoute Ticket</div>
                <div className="font-mono text-sm font-bold">{booking.ticketNo}</div>
              </div>
              <TicketCheck className="h-6 w-6" />
            </div>
            <div className="grid grid-cols-2 gap-4 px-5 py-4">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">From</div>
                <div className="text-base font-bold text-foreground">{booking.from}</div>
                <div className="text-[11px] text-muted-foreground">{booking.departure}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-muted-foreground">To</div>
                <div className="text-base font-bold text-foreground">{booking.to}</div>
                <div className="text-[11px] text-muted-foreground">{booking.date}</div>
              </div>
            </div>
            <div className="border-t border-dashed border-border px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground">Seat</div>
                  <div className="font-mono text-xl font-bold text-foreground">{booking.seat}</div>
                </div>
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-white">
                  <QrCode className="h-16 w-16 text-navy" />
                </div>
              </div>
            </div>
          </div>

          {/* Passenger */}
          <Section title="Passenger Details" icon={<User className="h-4 w-4" />}>
            <Row label="Name" value={booking.passenger} />
            <Row label="Gender" value={booking.gender === "M" ? "Male" : "Female"} />
            <Row label="Mobile" value={booking.mobile} />
          </Section>

          {/* Route */}
          <Section title="Route Information" icon={<MapPin className="h-4 w-4" />}>
            <Row label="Route" value={booking.route} />
            <Row label="Bus Number" value={booking.bus} />
            <Row label="Boarding Point" value={booking.boarding} />
            <Row label="Dropping Point" value={booking.dropping} />
          </Section>

          {/* Payment */}
          <Section title="Payment & Status" icon={<CreditCard className="h-4 w-4" />}>
            <Row label="Amount" value={`₹${booking.amount.toLocaleString("en-IN")}`} />
            <Row label="Payment Status" value={<PaymentPill status={booking.payment} />} />
            <Row label="Booking Status" value={<StatusPill status={booking.status} />} />
          </Section>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border bg-card p-4">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
            <Printer className="h-4 w-4" />
            Reprint
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-green/90">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
            <Phone className="h-4 w-4" />
            Contact
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100">
            <XCircle className="h-4 w-4" />
            Cancel
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

// Suppress unused warnings for icons reserved for future actions
void MoreHorizontal;
