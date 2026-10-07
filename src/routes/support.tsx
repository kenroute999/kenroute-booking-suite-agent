import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api/client";
import { shortDate, clock } from "@/lib/api/booking";
import {
  SUPPORT_CATEGORIES,
  createSupportTicket,
  listSupportTickets,
  supportKey,
  type NewSupportTicket,
  type SupportTicket,
} from "@/lib/api/support";
import { AgentShell } from "@/components/AgentShell";
import {
  LifeBuoy,
  CheckCircle2,
  Clock,
  Timer,
  Plus,
  X,
  MessageSquare,
  TicketIcon,
  CreditCard,
  Route as RouteIcon,
  Wrench,
  HelpCircle,
  BookOpen,
  ChevronRight,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/support")({
  component: SupportPage,
});

type Priority = "Low" | "Medium" | "High" | "Urgent";
type Status = "Open" | "In Progress" | "Resolved" | "Pending";

type Ticket = {
  id: string;
  subject: string;
  category: string;
  priority: Priority;
  created: string;
  status: Status;
};

const TICKETS: Ticket[] = [
  {
    id: "SUP10042",
    subject: "Unable to print ticket for PNR KR82145",
    category: "Ticket Problems",
    priority: "High",
    created: "31 May 2026, 11:20 AM",
    status: "Open",
  },
  {
    id: "SUP10041",
    subject: "Refund not credited for cancelled booking",
    category: "Payment Issues",
    priority: "Urgent",
    created: "31 May 2026, 09:45 AM",
    status: "In Progress",
  },
  {
    id: "SUP10040",
    subject: "Wrong boarding point shown on ticket",
    category: "Booking Issues",
    priority: "Medium",
    created: "30 May 2026, 06:10 PM",
    status: "Pending",
  },
  {
    id: "SUP10039",
    subject: "How to add new route to my panel?",
    category: "Route Queries",
    priority: "Low",
    created: "30 May 2026, 02:30 PM",
    status: "Resolved",
  },
  {
    id: "SUP10038",
    subject: "QR code not scanning at boarding",
    category: "Technical Support",
    priority: "High",
    created: "29 May 2026, 04:18 PM",
    status: "Resolved",
  },
  {
    id: "SUP10037",
    subject: "Wallet balance mismatch",
    category: "Payment Issues",
    priority: "Urgent",
    created: "29 May 2026, 11:02 AM",
    status: "Resolved",
  },
  {
    id: "SUP10036",
    subject: "App crashes on seat selection",
    category: "Technical Support",
    priority: "High",
    created: "28 May 2026, 03:55 PM",
    status: "Resolved",
  },
];

const STATS = [
  { label: "Open Tickets", value: "3", icon: LifeBuoy, color: "text-amber-600 bg-amber-500/10" },
  {
    label: "Resolved Tickets",
    value: "248",
    icon: CheckCircle2,
    color: "text-brand-green bg-brand-green/10",
  },
  { label: "Pending Requests", value: "7", icon: Clock, color: "text-blue-600 bg-blue-500/10" },
  {
    label: "Avg Response Time",
    value: "2h 14m",
    icon: Timer,
    color: "text-violet-600 bg-violet-500/10",
  },
];

const CATEGORIES = [
  { name: "Booking Issues", icon: TicketIcon, count: 24 },
  { name: "Payment Issues", icon: CreditCard, count: 18 },
  { name: "Ticket Problems", icon: TicketIcon, count: 12 },
  { name: "Route Queries", icon: RouteIcon, count: 9 },
  { name: "Technical Support", icon: Wrench, count: 31 },
];

const KB = [
  { type: "FAQ", title: "How to issue a refund for cancelled tickets?", reads: "1.2k" },
  { type: "Guide", title: "Setting up your agent commission preferences", reads: "986" },
  { type: "Article", title: "Understanding wallet payouts and processing time", reads: "742" },
  { type: "FAQ", title: "What to do if QR code fails to scan?", reads: "634" },
  { type: "Guide", title: "Step-by-step: Creating a new booking", reads: "521" },
];

function priorityClass(p: Priority) {
  return p === "Urgent"
    ? "bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/30"
    : p === "High"
      ? "bg-orange-500/15 text-orange-600 ring-1 ring-orange-500/30"
      : p === "Medium"
        ? "bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/30"
        : "bg-muted text-muted-foreground ring-1 ring-border";
}
function statusClass(s: Status) {
  return s === "Resolved"
    ? "bg-brand-green/15 text-brand-green ring-1 ring-brand-green/30"
    : s === "Open"
      ? "bg-blue-500/15 text-blue-600 ring-1 ring-blue-500/30"
      : s === "In Progress"
        ? "bg-violet-500/15 text-violet-600 ring-1 ring-violet-500/30"
        : "bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/30";
}

const PRIORITY_LABEL: Record<SupportTicket["priority"], Priority> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};
const STATUS_LABEL: Record<SupportTicket["status"], Status> = {
  OPEN: "Open",
  PENDING: "Pending",
  RESOLVED: "Resolved",
};

/** A saved ticket in the shape the table shows. */
const toRow = (t: SupportTicket): Ticket => ({
  id: t.ticketNo,
  subject: t.subject,
  category: t.category,
  priority: PRIORITY_LABEL[t.priority],
  created: `${shortDate(t.createdAt)}, ${clock(t.createdAt)}`,
  status: STATUS_LABEL[t.status],
});

const blankTicket: NewSupportTicket & { pnr: string } = {
  subject: "",
  category: SUPPORT_CATEGORIES[0],
  priority: "MEDIUM",
  pnr: "",
  description: "",
};

function NewTicketDrawer({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(blankTicket);
  const set = (patch: Partial<typeof blankTicket>) => setForm((f) => ({ ...f, ...patch }));
  const ready = form.subject.trim().length >= 3 && form.description.trim().length >= 5;

  const save = useMutation({
    mutationFn: () => {
      const { pnr, ...rest } = form;
      return createSupportTicket({ ...rest, ...(pnr.trim() && { pnr: pnr.trim() }) });
    },
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: supportKey });
      if (ticket.emailed) toast.success(`Ticket ${ticket.ticketNo} sent to KenRoute support`);
      else
        toast.warning(`Ticket ${ticket.ticketNo} saved. The email to support could not be sent.`);
      onClose();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <form
        className="flex w-full max-w-md flex-col bg-card shadow-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready && !save.isPending) save.mutate();
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-base font-semibold text-foreground">Create Support Ticket</div>
            <div className="text-xs text-muted-foreground">
              Saved and emailed to KenRoute support
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Subject</label>
            <input
              value={form.subject}
              maxLength={120}
              onChange={(e) => set({ subject: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder="Briefly describe the issue"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={form.category}
                onChange={(e) => set({ category: e.target.value as NewSupportTicket["category"] })}
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {SUPPORT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set({ priority: e.target.value as NewSupportTicket["priority"] })}
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Related Booking / PNR
            </label>
            <input
              value={form.pnr}
              maxLength={20}
              onChange={(e) => set({ pnr: e.target.value.toUpperCase() })}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              rows={6}
              value={form.description}
              maxLength={2000}
              onChange={(e) => set({ description: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background p-3 text-sm"
              placeholder="Provide as much detail as possible..."
            />
          </div>
        </div>
        <div className="flex gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-md border border-input bg-background text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!ready || save.isPending}
            className="flex-1 h-10 rounded-md bg-brand-green text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {save.isPending ? "Sending…" : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SupportPage() {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  // Tickets saved in the database come first; the sample rows stay below them.
  const mine = useQuery({ queryKey: supportKey, queryFn: listSupportTickets });
  const tickets = [...(mine.data ?? []).map(toRow), ...TICKETS];

  return (
    <AgentShell title="Support Center">
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </div>
                <div className={`rounded-lg p-2 ${s.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-foreground">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Categories */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.name}
              className="group rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-brand-green/40 hover:shadow-md"
            >
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold text-foreground">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">{c.count} articles</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Tickets table */}
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-foreground">My Support Tickets</div>
              <div className="text-xs text-muted-foreground">Recent issues and requests</div>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-brand-green px-3 text-sm font-semibold text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Create Ticket
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Ticket ID</th>
                  <th className="px-5 py-3 text-left font-medium">Subject</th>
                  <th className="px-5 py-3 text-left font-medium">Category</th>
                  <th className="px-5 py-3 text-left font-medium">Priority</th>
                  <th className="px-5 py-3 text-left font-medium">Created</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-border hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-brand-green">
                      {t.id}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{t.category}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${priorityClass(t.priority)}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{t.created}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusClass(t.status)}`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-green" />
              <div className="text-sm font-semibold text-foreground">Knowledge Base</div>
            </div>
          </div>
          <div className="p-3">
            {KB.map((k) => (
              <button
                key={k.title}
                className="group flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-muted/40"
              >
                <div className="mt-0.5 rounded bg-brand-green/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-green">
                  {k.type}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground group-hover:text-brand-green">
                    {k.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <HelpCircle className="h-3 w-3" /> {k.reads} reads
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live chat widget */}
      <button
        onClick={() => setChatOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-green text-white shadow-2xl shadow-brand-green/40 transition-transform hover:scale-110"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-40 flex h-96 w-80 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-foreground">
            <div>
              <div className="text-sm font-semibold">KenRoute Live Support</div>
              <div className="flex items-center gap-1.5 text-[11px] text-sidebar-foreground/70">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-green" /> Online ·
                Replies in ~2 min
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="rounded-md p-1 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-card px-3 py-2 text-xs shadow-sm">
              Hi Anil 👋 How can we help you today?
            </div>
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-green px-3 py-2 text-xs text-white">
              I need help with a refund.
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-card px-3 py-2 text-xs shadow-sm">
              Sure! Please share the booking PNR or ticket ID.
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
              placeholder="Type a message..."
            />
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-green text-white hover:opacity-90">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {open && <NewTicketDrawer onClose={() => setOpen(false)} />}
    </AgentShell>
  );
}
