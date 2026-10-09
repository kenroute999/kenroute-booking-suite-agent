import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingView, listMyBookings, myBookingsKey, type MyBooking } from "@/lib/api/booking";
import { AgentShell } from "@/components/AgentShell";
import {
  Search,
  Users,
  UserCheck,
  UserPlus,
  Repeat,
  Eye,
  Pencil,
  History,
  Phone,
  X,
  Mail,
  MapPin,
  Calendar,
  Wallet,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { SourceBadge, sourceFor } from "@/components/booking-source";

export const Route = createFileRoute("/passengers")({
  component: PassengersPage,
});

type Passenger = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  gender: "M" | "F";
  age: number;
  city: string;
  trips: number;
  lastJourney: string;
  lastRoute: string;
  status: "Active" | "Inactive" | "VIP";
  totalSpend: number;
  joinedOn: string;
  topRoutes: { route: string; trips: number }[];
  history: {
    date: string;
    route: string;
    bus: string;
    seat: string;
    amount: number;
    status: string;
  }[];
};

const cityCode = (city: string) => city.slice(0, 3).toUpperCase();

/** One passenger per mobile number, built from the agent's real bookings (newest first). */
function realPassengers(bookings: MyBooking[]): Passenger[] {
  const byPhone = new Map<string, ReturnType<typeof bookingView>[]>();
  for (const b of bookings) {
    if (!b.passenger) continue;
    const v = bookingView(b);
    byPhone.set(v.phone, [...(byPhone.get(v.phone) ?? []), v]);
  }
  return [...byPhone.values()].flatMap((trips) => {
    const latest = trips[0];
    const first = trips[trips.length - 1];
    if (!latest || !first) return [];
    const routes = new Map<string, number>();
    for (const t of trips) routes.set(t.route, (routes.get(t.route) ?? 0) + 1);
    const paid = trips.filter((t) => t.status !== "CANCELLED" && t.status !== "REFUNDED");
    return [
      {
        id: `PAX${latest.phone.slice(-5)}`,
        name: latest.passenger,
        mobile: latest.mobile,
        email: "—",
        gender: latest.gender,
        age: latest.age,
        city: latest.from,
        trips: trips.length,
        lastJourney: latest.date,
        lastRoute: `${cityCode(latest.from)} → ${cityCode(latest.to)}`,
        status: "Active" as const,
        totalSpend: paid.reduce((sum, t) => sum + t.amount, 0),
        joinedOn: first.issuedAt.split(" · ")[0] ?? first.date,
        topRoutes: [...routes].map(([route, count]) => ({ route, trips: count })),
        history: trips.map((t) => ({
          date: t.date,
          route: `${cityCode(t.from)} → ${cityCode(t.to)}`,
          bus: t.bus,
          seat: t.seat,
          amount: t.amount,
          status: t.status.charAt(0) + t.status.slice(1).toLowerCase(),
        })),
      },
    ];
  });
}

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  tone?: "default" | "green" | "blue" | "amber";
}) {
  const tones: Record<string, string> = {
    default: "bg-muted text-foreground",
    green: "bg-brand-green/10 text-brand-green",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
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

function StatusPill({ status }: { status: Passenger["status"] }) {
  const map = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Inactive: "bg-slate-100 text-slate-600 ring-slate-200",
    VIP: "bg-amber-50 text-amber-700 ring-amber-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${map[status]}`}
    >
      {status}
    </span>
  );
}

function PassengersPage() {
  const mine = useQuery({ queryKey: myBookingsKey, queryFn: listMyBookings });
  const PASSENGERS = useMemo(() => realPassengers(mine.data ?? []), [mine.data]);
  const repeat = PASSENGERS.filter((p) => p.trips > 1).length;
  const [query, setQuery] = useState("");
  const [field, setField] = useState<"all" | "name" | "mobile" | "id">("all");
  const [statusFilter, setStatusFilter] = useState<"All" | Passenger["status"]>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Passenger | null>(null);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PASSENGERS.filter((p) => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (!q) return true;
      if (field === "name") return p.name.toLowerCase().includes(q);
      if (field === "mobile") return p.mobile.toLowerCase().includes(q);
      if (field === "id") return p.id.toLowerCase().includes(q);
      return (
        p.name.toLowerCase().includes(q) ||
        p.mobile.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });
  }, [query, field, statusFilter, PASSENGERS]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AgentShell title="Passengers Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Passengers"
            value={PASSENGERS.length.toLocaleString("en-IN")}
            icon={Users}
            hint="From your bookings"
            tone="blue"
          />
          <StatCard
            label="Tickets Booked"
            value={PASSENGERS.reduce((sum, p) => sum + p.trips, 0).toLocaleString("en-IN")}
            icon={UserCheck}
            hint="All their trips"
            tone="green"
          />
          <StatCard
            label="One-time Customers"
            value={String(PASSENGERS.length - repeat)}
            icon={UserPlus}
            hint="1 trip so far"
            tone="amber"
          />
          <StatCard label="Repeat Customers" value={String(repeat)} icon={Repeat} hint="2+ trips" />
        </div>

        {/* Search + filters */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <select
                value={field}
                onChange={(e) => setField(e.target.value as typeof field)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground"
              >
                <option value="all">All Fields</option>
                <option value="name">Name</option>
                <option value="mobile">Mobile Number</option>
                <option value="id">Passenger ID</option>
              </select>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(
                      field === "mobile"
                        ? e.target.value.replace(/\D/g, "").slice(0, 10)
                        : e.target.value,
                    );
                    setPage(1);
                  }}
                  inputMode={field === "mobile" ? "numeric" : undefined}
                  maxLength={field === "mobile" ? 10 : undefined}
                  placeholder="Search by name, mobile or passenger ID…"
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-green/40"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(["All", "Active", "VIP", "Inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
                    statusFilter === s
                      ? "bg-brand-green text-white ring-brand-green"
                      : "bg-card text-muted-foreground ring-border hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Passenger ID</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Mobile</th>
                  <th className="px-5 py-3">Gender</th>
                  <th className="px-5 py-3">Total Trips</th>
                  <th className="px-5 py-3">Last Journey</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Customer Type</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageRows.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-foreground">
                      {p.id}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${
                            p.gender === "M" ? "bg-blue-500" : "bg-pink-500"
                          }`}
                        >
                          {p.name
                            .split(" ")
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-foreground">{p.mobile}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                          p.gender === "M" ? "bg-blue-500" : "bg-pink-500"
                        }`}
                      >
                        {p.gender}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-foreground">{p.trips}</td>
                    <td className="px-5 py-3">
                      <div className="text-foreground">{p.lastJourney}</div>
                      <div className="text-xs text-muted-foreground">{p.lastRoute}</div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="px-5 py-3">
                      {p.status === "VIP" ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                          VIP
                        </span>
                      ) : (
                        <SourceBadge
                          source={sourceFor(p.id) === "Corporate" ? "Corporate" : "Agent"}
                        />
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelected(p)}
                          title="View Profile"
                          className="rounded-md p-2 text-muted-foreground hover:bg-brand-green/10 hover:text-brand-green"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Edit"
                          className="rounded-md p-2 text-muted-foreground hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="Journey History"
                          onClick={() => setSelected(p)}
                          className="rounded-md p-2 text-muted-foreground hover:bg-amber-50 hover:text-amber-600"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          title="Contact"
                          className="rounded-md p-2 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-sm text-muted-foreground"
                    >
                      No passengers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm">
            <div className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{pageRows.length}</span> of{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span> passengers
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setSelected(null)} />
          <aside className="flex h-full w-full max-w-xl flex-col bg-background shadow-2xl">
            {/* header */}
            <div className="bg-sidebar p-5 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ${
                      selected.gender === "M" ? "bg-blue-500" : "bg-pink-500"
                    }`}
                  >
                    {selected.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="text-lg font-bold">{selected.name}</div>
                    <div className="text-xs text-white/60">
                      {selected.id} · {selected.gender === "M" ? "Male" : "Female"}, {selected.age}
                    </div>
                    <div className="mt-1">
                      <StatusPill status={selected.status} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {/* Top stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Trips
                  </div>
                  <div className="mt-1 text-xl font-bold text-foreground">{selected.trips}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Spend
                  </div>
                  <div className="mt-1 text-xl font-bold text-brand-green">
                    ₹{selected.totalSpend.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Since
                  </div>
                  <div className="mt-1 text-sm font-bold text-foreground">{selected.joinedOn}</div>
                </div>
              </div>

              {/* Contact */}
              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Contact Information
                </h3>
                <div className="space-y-2 rounded-xl border border-border bg-card p-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-brand-green" />
                    <span className="text-foreground">{selected.mobile}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-brand-green" />
                    <span className="text-foreground">{selected.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-brand-green" />
                    <span className="text-foreground">{selected.city}</span>
                  </div>
                </div>
              </section>

              {/* Frequent routes */}
              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Frequently Used Routes
                </h3>
                <div className="space-y-2">
                  {selected.topRoutes.map((r) => (
                    <div
                      key={r.route}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <TrendingUp className="h-4 w-4 text-brand-green" />
                        {r.route}
                      </div>
                      <span className="rounded-full bg-brand-green/10 px-2.5 py-0.5 text-xs font-semibold text-brand-green">
                        {r.trips} trips
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Travel history */}
              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Travel History
                </h3>
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/60 text-left font-semibold text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Route</th>
                        <th className="px-3 py-2">Bus</th>
                        <th className="px-3 py-2">Seat</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {selected.history.map((h, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {h.date}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-foreground">{h.route}</td>
                          <td className="px-3 py-2 font-mono text-muted-foreground">{h.bus}</td>
                          <td className="px-3 py-2 font-semibold text-foreground">{h.seat}</td>
                          <td className="px-3 py-2 text-right font-semibold text-brand-green">
                            ₹{h.amount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="flex items-center gap-2 border-t border-border bg-card p-4">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-green/90">
                <Phone className="h-4 w-4" /> Contact Passenger
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                <Wallet className="h-4 w-4" /> New Booking
              </button>
            </div>
          </aside>
        </div>
      )}
    </AgentShell>
  );
}
