import {
  UserCheck,
  Building2,
  Phone,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Cloud,
  ShieldCheck,
  Activity,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types & data                                                       */
/* ------------------------------------------------------------------ */
export type BookingSource = "Agent" | "Counter" | "Phone" | "Corporate";

export const BOOKING_SOURCES: BookingSource[] = ["Agent", "Counter", "Phone", "Corporate"];

export const SOURCE_META: Record<
  BookingSource,
  {
    label: string;
    full: string;
    icon: typeof UserCheck;
    /** Tailwind classes for soft chip/badge */
    chip: string;
    /** Tailwind classes for solid dot */
    dot: string;
    /** Hex used for SVG charts */
    hex: string;
  }
> = {
  Agent: {
    label: "Agent",
    full: "Agent Walk-in",
    icon: UserCheck,
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
    hex: "#10b981",
  },
  Counter: {
    label: "Counter",
    full: "Counter Booking",
    icon: Building2,
    chip: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
    dot: "bg-orange-500",
    hex: "#f97316",
  },
  Phone: {
    label: "Phone",
    full: "Phone Booking",
    icon: Phone,
    chip: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    dot: "bg-blue-500",
    hex: "#3b82f6",
  },
  Corporate: {
    label: "Corporate",
    full: "Corporate Booking",
    icon: Briefcase,
    chip: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    dot: "bg-violet-500",
    hex: "#8b5cf6",
  },
};

/** Deterministic source assignment for existing mock rows. */
export function sourceFor(seed: string | number): BookingSource {
  const s = String(seed);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return BOOKING_SOURCES[h % BOOKING_SOURCES.length];
}

/* ------------------------------------------------------------------ */
/* Badge                                                              */
/* ------------------------------------------------------------------ */
export function SourceBadge({
  source,
  full = false,
  className = "",
}: {
  source: BookingSource;
  full?: boolean;
  className?: string;
}) {
  const m = SOURCE_META[source];
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${m.chip} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {full ? m.full : m.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Source Summary (counts + revenue per source)                       */
/* ------------------------------------------------------------------ */
export type SourceStat = { source: BookingSource; count: number; revenue: number };

export function SourceSummaryGrid({
  title = "Booking Source Summary",
  stats,
}: {
  title?: string;
  stats: SourceStat[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">Bookings & revenue by source channel</p>
        </div>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const m = SOURCE_META[s.source];
          const Icon = m.icon;
          return (
            <div
              key={s.source}
              className="rounded-xl border border-border bg-background p-4 transition hover:shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.chip}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <SourceBadge source={s.source} />
              </div>
              <div className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {m.full}
              </div>
              <div className="mt-1 flex items-end justify-between gap-2">
                <div className="text-2xl font-bold text-foreground">{s.count}</div>
                <div className="text-sm font-semibold text-brand-green">
                  ₹{s.revenue.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pie Chart for source contribution                                  */
/* ------------------------------------------------------------------ */
export function SourcePieChart({
  title = "Today's Booking Sources",
  stats,
}: {
  title?: string;
  stats: SourceStat[];
}) {
  const total = stats.reduce((s, x) => s + x.count, 0) || 1;
  const r = 70;
  const cx = 90;
  const cy = 90;
  let acc = 0;
  const arcs = stats.map((s) => {
    const pct = s.count / total;
    const start = acc * Math.PI * 2 - Math.PI / 2;
    acc += pct;
    const end = acc * Math.PI * 2 - Math.PI / 2;
    const large = pct > 0.5 ? 1 : 0;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { d, source: s.source, pct };
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">Source contribution share</p>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0">
          {arcs.map((a) => (
            <path key={a.source} d={a.d} fill={SOURCE_META[a.source].hex} />
          ))}
          <circle cx={cx} cy={cy} r={38} fill="white" />
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] uppercase"
          >
            Total
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            className="fill-foreground text-base font-bold"
          >
            {total}
          </text>
        </svg>
        <div className="flex-1 space-y-2 min-w-[180px]">
          {arcs.map((a) => {
            const m = SOURCE_META[a.source];
            const stat = stats.find((s) => s.source === a.source)!;
            return (
              <div key={a.source} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-sm ${m.dot}`} />
                  <span className="font-medium text-foreground">{m.full}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">{stat.count}</span>
                  <span className="font-semibold text-foreground w-12 text-right">
                    {Math.round(a.pct * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Inventory sync status card                                         */
/* ------------------------------------------------------------------ */
export function InventorySyncCard() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Inventory Sync</h3>
          <p className="text-xs text-muted-foreground">OTA integration readiness</p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-2.5 py-1 text-[11px] font-semibold text-brand-green ring-1 ring-brand-green/30">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
          Live
        </div>
      </div>
      <div className="space-y-3">
        <SyncRow
          icon={ShieldCheck}
          label="Inventory Status"
          value="Ready for OTA Integration"
          tone="green"
        />
        <SyncRow icon={Cloud} label="Sync Status" value="Monitoring Enabled" tone="blue" />
        <SyncRow icon={RefreshCw} label="Last Inventory Refresh" value="Just Now" tone="amber" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          OTA Channels
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
          redBus · Pending
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
          AbhiBus · Pending
        </span>
      </div>
    </section>
  );
}

function SyncRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Cloud;
  label: string;
  value: string;
  tone: "green" | "blue" | "amber";
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  } as const;
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inventory Banner (compact, for New Booking page)                   */
/* ------------------------------------------------------------------ */
export function InventoryStatusBanner() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold text-foreground">Inventory Status:</span>
          <span className="text-emerald-700 font-semibold">Available</span>
        </div>
        <div className="hidden h-4 w-px bg-emerald-200 sm:block" />
        <div className="flex items-center gap-2 text-sm">
          <Cloud className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-foreground">OTA Sync Status:</span>
          <span className="text-blue-700 font-semibold">Ready</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <RefreshCw className="h-3 w-3" />
        Synced just now
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seat conflict warning                                              */
/* ------------------------------------------------------------------ */
export function SeatConflictBanner({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
      <div className="flex-1 text-sm">
        <div className="font-semibold text-rose-800">Seat conflict detected</div>
        <div className="text-rose-700">
          Seat is no longer available. Please select another seat.
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-xs font-semibold text-rose-700 hover:underline"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Booking validation panel                                           */
/* ------------------------------------------------------------------ */
export function BookingValidationPanel({
  routeOk = true,
  seatsOk = true,
  fareOk = true,
  ticketReady = true,
}: {
  routeOk?: boolean;
  seatsOk?: boolean;
  fareOk?: boolean;
  ticketReady?: boolean;
}) {
  const items = [
    { label: "Route Available", ok: routeOk },
    { label: "Seats Available", ok: seatsOk },
    { label: "Fare Verified", ok: fareOk },
    { label: "Ready to Generate Ticket", ok: ticketReady },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Booking Validation</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] font-bold text-brand-green">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" />
          Live
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((i) => (
          <li
            key={i.label}
            className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <span className="text-foreground">{i.label}</span>
            {i.ok ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                Pending
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Booking source selector (radio chips)                              */
/* ------------------------------------------------------------------ */
export function BookingSourceSelector({
  value,
  onChange,
}: {
  value: BookingSource;
  onChange: (v: BookingSource) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Booking Source</h3>
          <p className="text-[11px] text-muted-foreground">
            Track where this booking originated for reporting & OTA sync
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BOOKING_SOURCES.map((s) => {
          const m = SOURCE_META[s];
          const Icon = m.icon;
          const active = value === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition ${
                active
                  ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green/30"
                  : "border-border bg-background hover:border-brand-green/40 hover:bg-brand-green/5"
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${m.chip}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-foreground">{m.full}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal bar comparison (used on reports/wallet/tickets)         */
/* ------------------------------------------------------------------ */
export function SourceBarComparison({
  title,
  subtitle,
  metric = "Revenue",
  stats,
  formatter = (v) => `₹${v.toLocaleString("en-IN")}`,
  pick = "revenue",
}: {
  title: string;
  subtitle?: string;
  metric?: string;
  stats: SourceStat[];
  formatter?: (v: number) => string;
  pick?: "revenue" | "count";
}) {
  const max = Math.max(...stats.map((s) => (pick === "revenue" ? s.revenue : s.count)), 1);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {metric}
        </span>
      </div>
      <div className="space-y-3">
        {stats.map((s) => {
          const m = SOURCE_META[s.source];
          const v = pick === "revenue" ? s.revenue : s.count;
          const pct = (v / max) * 100;
          return (
            <div key={s.source}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-sm ${m.dot}`} />
                  <span className="font-medium text-foreground">{m.full}</span>
                </div>
                <span className="font-semibold text-foreground">{formatter(v)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: m.hex }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
