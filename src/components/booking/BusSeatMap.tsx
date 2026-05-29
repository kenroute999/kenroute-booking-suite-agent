import { useState } from "react";
import { User, X, Check } from "lucide-react";

export type SeatStatus = "available" | "male" | "female" | "blocked";

export interface Seat {
  id: string;
  status: SeatStatus;
  passenger?: { name: string; gender: "Male" | "Female"; mobile: string };
}

interface Props {
  deckLabel: string;
  seats: Seat[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function BusSeatMap({ deckLabel, seats, selected, onToggle }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  // 4 rows x 6 cols layout
  const rows = [seats.slice(0, 6), seats.slice(6, 12), seats.slice(12, 18), seats.slice(18, 24)];

  const seatClass = (s: Seat, isSelected: boolean) => {
    if (isSelected) return "bg-seat-selected/30 ring-2 ring-seat-selected text-amber-900";
    switch (s.status) {
      case "available":
        return "bg-seat-available/25 ring-1 ring-seat-available/60 text-emerald-900 hover:ring-2 hover:ring-seat-available";
      case "male":
        return "bg-seat-male/25 ring-1 ring-seat-male/60 text-blue-900 cursor-not-allowed";
      case "female":
        return "bg-seat-female/25 ring-1 ring-seat-female/60 text-pink-900 cursor-not-allowed";
      case "blocked":
        return "bg-seat-blocked/40 ring-1 ring-seat-blocked text-muted-foreground cursor-not-allowed";
    }
  };

  return (
    <div className="relative rounded-3xl border-2 border-slate-300 bg-gradient-to-b from-slate-50 to-white p-5 shadow-inner">
      {/* Bus frame */}
      <div className="flex gap-4">
        {/* Driver column */}
        <div className="flex w-24 shrink-0 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-100/60 p-3">
          <div className="space-y-2">
            <div className="flex h-14 w-full items-center justify-center rounded-full border-4 border-slate-300 bg-white text-[10px] font-semibold text-slate-500">
              <div className="h-8 w-8 rounded-full border-4 border-slate-400" />
            </div>
            <div className="text-center text-[11px] font-medium text-slate-500">Driver</div>
          </div>
          <div className="space-y-1 pt-6">
            <div className="text-center text-[11px] font-medium text-slate-500">Entry / Exit</div>
            <div className="flex h-10 items-center justify-center rounded-lg border border-dashed border-brand-green text-brand-green">
              →
            </div>
          </div>
        </div>

        {/* Seats grid */}
        <div className="flex-1 space-y-2">
          {rows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-6 gap-2">
              {row.map((seat) => {
                const isSel = selected.includes(seat.id);
                const clickable = seat.status === "available" || isSel;
                return (
                  <div key={seat.id} className="relative">
                    <button
                      disabled={!clickable}
                      onMouseEnter={() => setHovered(seat.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => clickable && onToggle(seat.id)}
                      className={`relative flex h-16 w-full flex-col items-center justify-center rounded-lg text-xs font-semibold transition ${seatClass(
                        seat,
                        isSel,
                      )}`}
                    >
                      <span>{seat.id}</span>
                      {isSel && <Check className="mt-0.5 h-3.5 w-3.5" />}
                      {!isSel && seat.status === "male" && <User className="mt-0.5 h-3 w-3" />}
                      {!isSel && seat.status === "female" && <User className="mt-0.5 h-3 w-3" />}
                      {!isSel && seat.status === "blocked" && <X className="mt-0.5 h-3 w-3" />}
                    </button>

                    {hovered === seat.id && (
                      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-44 -translate-x-1/2 rounded-lg border border-border bg-popover p-3 text-left text-[11px] shadow-elevated">
                        <div className="font-semibold text-foreground">Seat: {seat.id}</div>
                        <div className="mt-0.5 text-muted-foreground">
                          Status:{" "}
                          <span className="font-medium capitalize text-foreground">
                            {seat.status === "male" || seat.status === "female"
                              ? "Booked"
                              : seat.status}
                          </span>
                        </div>
                        {seat.passenger && (
                          <>
                            <div className="text-muted-foreground">
                              Passenger:{" "}
                              <span className="font-medium text-foreground">{seat.passenger.name}</span>
                            </div>
                            <div className="text-muted-foreground">
                              Gender:{" "}
                              <span
                                className={
                                  seat.passenger.gender === "Female"
                                    ? "font-medium text-pink-600"
                                    : "font-medium text-blue-600"
                                }
                              >
                                {seat.passenger.gender}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              Mobile:{" "}
                              <span className="font-medium text-foreground">
                                {seat.passenger.mobile}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -top-3 left-6 rounded-full bg-navy px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
        {deckLabel}
      </div>
    </div>
  );
}
