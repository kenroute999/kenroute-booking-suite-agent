import { User, X, Check } from "lucide-react";
import type { TripSeat } from "@/lib/api/booking";

interface Props {
  deckLabel: string;
  seats: TripSeat[];
  selected: string[];
  onToggle: (id: string) => void;
}

const isBed = (seat: TripSeat) => seat.seatType.includes("SLEEPER");

function seatClass(seat: TripSeat, isSelected: boolean) {
  if (isSelected) return "bg-seat-selected/30 ring-2 ring-seat-selected text-amber-900";
  if (seat.status === "AVAILABLE") {
    return "bg-seat-available/25 ring-1 ring-seat-available/60 text-emerald-900 hover:ring-2 hover:ring-seat-available";
  }
  if (seat.status === "BOOKED") {
    return seat.passengerGender === "FEMALE"
      ? "bg-seat-female/25 ring-1 ring-seat-female/60 text-pink-900 cursor-not-allowed"
      : "bg-seat-male/25 ring-1 ring-seat-male/60 text-blue-900 cursor-not-allowed";
  }
  return "bg-seat-blocked/40 ring-1 ring-seat-blocked text-muted-foreground cursor-not-allowed";
}

function seatTitle(seat: TripSeat) {
  const kind =
    seat.seatType === "DOUBLE_SLEEPER" ? "Double bed" : isBed(seat) ? "Single bed" : "Seat";
  const what = `${kind} ${seat.seatNumber}`;
  if (seat.status === "AVAILABLE") {
    return `${what} · Available · ₹${Number(seat.fare).toLocaleString("en-IN")}`;
  }
  if (seat.status === "BOOKED") return `${what} · Booked`;
  if (seat.status === "HELD") return `${what} · Being booked by another agent`;
  return `${what} · Blocked`;
}

/**
 * One deck of the bus, drawn from the layout the owner set for it in Admin.
 * The bus is shown lengthwise with the driver on the left: a seat's `row` runs
 * front to back (left to right here) and its `col` runs across the width. A
 * column with no seats is the aisle. A bed is as long as two seats, so beds and
 * seats on the same deck line up the way they do in the bus.
 */
export function BusSeatMap({ deckLabel, seats, selected, onToggle }: Props) {
  const widest = Math.max(0, ...seats.map((s) => s.col));
  const used = new Set(seats.map((s) => s.col));
  const tracks = Array.from({ length: widest + 1 }, (_, col) =>
    used.has(col) ? "3.25rem" : "0.9rem",
  );

  return (
    <div className="relative rounded-3xl border-2 border-slate-300 bg-gradient-to-b from-slate-50 to-white p-5 shadow-inner">
      <div className="flex gap-4">
        <div className="flex w-20 shrink-0 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-100/60 p-3">
          <div className="space-y-2">
            <div className="flex h-12 w-full items-center justify-center rounded-full border-4 border-slate-300 bg-white">
              <div className="h-6 w-6 rounded-full border-4 border-slate-400" />
            </div>
            <div className="text-center text-[11px] font-medium text-slate-500">Driver</div>
          </div>
          <div className="space-y-1 pt-4">
            <div className="text-center text-[11px] font-medium text-slate-500">Entry / Exit</div>
            <div className="flex h-9 items-center justify-center rounded-lg border border-dashed border-brand-green text-brand-green">
              →
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto pb-1">
          <div
            className="grid auto-cols-[2.5rem] grid-flow-col gap-1.5"
            style={{ gridTemplateRows: tracks.join(" ") }}
          >
            {seats.map((seat) => {
              const isSelected = selected.includes(seat.id);
              const clickable = seat.status === "AVAILABLE" || isSelected;
              const bed = isBed(seat);
              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={!clickable}
                  title={seatTitle(seat)}
                  aria-pressed={isSelected}
                  onClick={() => onToggle(seat.id)}
                  style={{
                    gridColumn: bed ? `${seat.row * 2 + 1} / span 2` : `${seat.row + 1}`,
                    gridRowStart: seat.col + 1,
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-lg text-[11px] font-semibold leading-tight transition ${seatClass(seat, isSelected)}`}
                >
                  {/* A bed shows its pillow end; a seat shows its backrest. */}
                  <span
                    aria-hidden
                    className={
                      bed
                        ? "absolute bottom-1.5 left-1 top-1.5 w-1.5 rounded-full bg-current opacity-25"
                        : "absolute left-0.5 top-1 bottom-1 w-1 rounded-full bg-current opacity-20"
                    }
                  />
                  <span>{seat.seatNumber}</span>
                  {isSelected && <Check className="mt-0.5 h-3.5 w-3.5" />}
                  {!isSelected && seat.status === "AVAILABLE" && (
                    <span className="text-[9px] font-medium opacity-70">
                      ₹{Number(seat.fare).toLocaleString("en-IN")}
                    </span>
                  )}
                  {!isSelected && seat.status === "BOOKED" && <User className="mt-0.5 h-3 w-3" />}
                  {!isSelected && (seat.status === "BLOCKED" || seat.status === "HELD") && (
                    <X className="mt-0.5 h-3 w-3" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute -top-3 left-6 rounded-full bg-navy px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
        {deckLabel}
      </div>
    </div>
  );
}
