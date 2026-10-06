import { User, X, Check } from "lucide-react";
import type { TripSeat } from "@/lib/api/booking";

interface Props {
  deckLabel: string;
  seats: TripSeat[];
  selected: string[];
  onToggle: (id: string) => void;
}

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
  if (seat.status === "AVAILABLE") {
    return `Seat ${seat.seatNumber} · Available · ₹${Number(seat.fare).toLocaleString("en-IN")}`;
  }
  if (seat.status === "BOOKED") return `Seat ${seat.seatNumber} · Booked`;
  if (seat.status === "HELD") return `Seat ${seat.seatNumber} · Being booked by another agent`;
  return `Seat ${seat.seatNumber} · Blocked`;
}

/**
 * One deck of the bus, drawn from each seat's position in the owner's layout.
 * The bus is shown lengthwise: `row` runs front to back (left to right here),
 * `col` runs across its width. A missing position is the aisle.
 */
export function BusSeatMap({ deckLabel, seats, selected, onToggle }: Props) {
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
          <div className="grid auto-cols-[4rem] grid-flow-col auto-rows-[3.5rem] gap-2">
            {seats.map((seat) => {
              const isSelected = selected.includes(seat.id);
              const clickable = seat.status === "AVAILABLE" || isSelected;
              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={!clickable}
                  title={seatTitle(seat)}
                  aria-pressed={isSelected}
                  onClick={() => onToggle(seat.id)}
                  style={{ gridColumnStart: seat.row + 1, gridRowStart: seat.col + 1 }}
                  className={`flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition ${seatClass(seat, isSelected)}`}
                >
                  <span>{seat.seatNumber}</span>
                  {!isSelected && seat.status === "AVAILABLE" && (
                    <span className="text-[9px] font-medium opacity-70">
                      ₹{Number(seat.fare).toLocaleString("en-IN")}
                    </span>
                  )}
                  {isSelected && <Check className="mt-0.5 h-3.5 w-3.5" />}
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
