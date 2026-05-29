import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import logo from "@/assets/kenroute-logo.png";
import {
  LayoutDashboard,
  TicketPlus,
  History,
  Ticket,
  Users,
  Wallet,
  BarChart3,
  Tag,
  HelpCircle,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/new-booking", label: "New Booking", icon: TicketPlus },
  { to: "/booking-history", label: "Booking History", icon: History },
  { to: "/tickets", label: "Tickets", icon: Ticket },
  { to: "/passengers", label: "Passengers", icon: Users },
  { to: "/wallet", label: "Wallet / Commission", icon: Wallet },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/offers", label: "Offers", icon: Tag },
  { to: "/support", label: "Support", icon: HelpCircle },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AgentShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <img src={logo} alt="KenRoute" className="h-10 w-auto rounded-md bg-white p-1" />
          <div className="leading-tight">
            <div className="text-base font-bold">KenRoute</div>
            <div className="text-[11px] text-sidebar-foreground/60">Agent Panel</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-sm">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to as "/"}
              activeOptions={{ exact: true }}
              activeProps={{
                className:
                  "flex items-center gap-3 rounded-lg bg-brand-green/15 px-3 py-2.5 font-semibold text-brand-green ring-1 ring-brand-green/30",
              }}
              inactiveProps={{
                className:
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 hover:bg-white/5 hover:text-white",
              }}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mx-3 mb-3 rounded-xl border border-sidebar-border bg-white/[0.03] p-4">
          <div className="text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
            Wallet Balance
          </div>
          <div className="mt-1 text-xl font-bold text-brand-green">₹12,450.00</div>
          <div className="mt-1 text-[11px] text-sidebar-foreground/60">Available for Booking</div>
        </div>

        <button className="mx-3 mb-4 flex items-center gap-3 rounded-lg border border-sidebar-border px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-muted-foreground hover:bg-muted">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-green px-1 text-[10px] font-bold text-white">
                3
              </span>
            </button>
            <div className="flex items-center gap-3 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
                A
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-foreground">Anil Agent</div>
                <div className="text-[11px] text-muted-foreground">Agent ID: AGT1024</div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
