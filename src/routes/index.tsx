import { createFileRoute, Link } from "@tanstack/react-router";
import { AgentShell } from "@/components/AgentShell";
import { TicketPlus, TrendingUp, Wallet, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — KenRoute Agent Panel" },
      { name: "description", content: "Bus booking agent dashboard for KenRoute." },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Today's Bookings", value: "28", icon: TicketPlus, tint: "bg-brand-green/10 text-brand-green" },
  { label: "Revenue", value: "₹42,300", icon: TrendingUp, tint: "bg-blue-500/10 text-blue-600" },
  { label: "Commission", value: "₹4,230", icon: Wallet, tint: "bg-amber-500/10 text-amber-600" },
  { label: "Passengers", value: "56", icon: Users, tint: "bg-pink-500/10 text-pink-600" },
];

function Dashboard() {
  return (
    <AgentShell title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.tint}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="text-lg font-semibold">Quick Action</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a new booking for your customer.
          </p>
          <Link
            to="/new-booking"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark"
          >
            <TicketPlus className="h-4 w-4" />
            New Booking
          </Link>
        </div>
      </div>
    </AgentShell>
  );
}
