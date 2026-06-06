import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AgentShell } from "@/components/AgentShell";
import { BusSeatMap, type Seat } from "@/components/booking/BusSeatMap";
import {
  ArrowRight,
  Calendar,
  Bus,
  Clock,
  MapPin,
  Armchair,
  CircleCheck,
  CircleX,
  Mars,
  Venus,
  Star,
  RefreshCw,
  Plus,
  Trash2,
  Ticket,
  PlugZap,
  Wind,
  Lightbulb,
  Droplet,
} from "lucide-react";
import {
  BookingSourceSelector,
  InventoryStatusBanner,
  SeatConflictBanner,
  BookingValidationPanel,
  type BookingSource,
} from "@/components/booking-source";

export const Route = createFileRoute("/new-booking")({
  head: () => ({
    meta: [
      { title: "New Booking — KenRoute Agent Panel" },
      {
        name: "description",
        content: "Create a new bus ticket booking with live seat selection on KenRoute.",
      },
    ],
  }),
  component: NewBooking,
});

const SEAT_FARE = 1250;
const COMMISSION_RATE = 0.1;

function makeLowerDeck(): Seat[] {
  // 24 seats L1..L24
  const ids = Array.from({ length: 24 }, (_, i) => `L${i + 1}`);
  const bookedMale = new Set(["L3", "L6", "L9", "L14", "L18"]);
  const bookedFemale = new Set(["L4", "L11", "L15", "L22"]);
  const blocked = new Set(["L12", "L20"]);
  return ids.map<Seat>((id) => {
    if (bookedMale.has(id))
      return {
        id,
        status: "male",
        passenger: { name: "Ramesh Kumar", gender: "Male", mobile: "98xxxx3210" },
      };
    if (bookedFemale.has(id))
      return {
        id,
        status: "female",
        passenger: { name: "Priya Sharma", gender: "Female", mobile: "91xxxx6780" },
      };
    if (blocked.has(id)) return { id, status: "blocked" };
    return { id, status: "available" };
  });
}

function makeUpperDeck(): Seat[] {
  const ids = Array.from({ length: 24 }, (_, i) => `U${i + 1}`);
  const bookedMale = new Set(["U1", "U7", "U10", "U13", "U16", "U19", "U21", "U23", "U24", "U5"]);
  const bookedFemale = new Set(["U2", "U8", "U11", "U17", "U22"]);
  const blocked = new Set(["U6"]);
  return ids.map<Seat>((id) => {
    if (bookedMale.has(id))
      return {
        id,
        status: "male",
        passenger: { name: "Arjun Reddy", gender: "Male", mobile: "98xxxx1122" },
      };
    if (bookedFemale.has(id))
      return {
        id,
        status: "female",
        passenger: { name: "Sneha Iyer", gender: "Female", mobile: "91xxxx5566" },
      };
    if (blocked.has(id)) return { id, status: "blocked" };
    return { id, status: "available" };
  });
}

interface Passenger {
  seatId: string;
  name: string;
  gender: "Male" | "Female";
  age: string;
  mobile: string;
  idType: string;
  idNumber: string;
}

function NewBooking() {
  const [deck, setDeck] = useState<"lower" | "upper">("lower");
  const [bookingSource, setBookingSource] = useState<BookingSource>("Agent");
  const [showConflict, setShowConflict] = useState(false);
  void setShowConflict;

  const lower = useMemo(makeLowerDeck, []);
  const upper = useMemo(makeUpperDeck, []);
  const seats = deck === "lower" ? lower : upper;

  const [selected, setSelected] = useState<string[]>(["L10"]);
  const [passengers, setPassengers] = useState<Record<string, Passenger>>({
    L10: {
      seatId: "L10",
      name: "Ramesh Kumar",
      gender: "Male",
      age: "32",
      mobile: "9876543210",
      idType: "Aadhaar Card",
      idNumber: "1234 5678 9012",
    },
  });

  const toggleSeat = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((s) => s !== id);
        setPassengers((p) => {
          const copy = { ...p };
          delete copy[id];
          return copy;
        });
        return next;
      }
      const next = [...prev, id];
      setPassengers((p) => ({
        ...p,
        [id]: {
          seatId: id,
          name: "",
          gender: "Male",
          age: "",
          mobile: "",
          idType: "Aadhaar Card",
          idNumber: "",
        },
      }));
      return next;
    });
  };

  const updatePassenger = (id: string, patch: Partial<Passenger>) =>
    setPassengers((p) => ({ ...p, [id]: { ...p[id], ...patch } }));

  // Combined stats from both decks
  const allSeats = [...lower, ...upper];
  const totalSeats = allSeats.length;
  const booked = allSeats.filter((s) => s.status === "male" || s.status === "female").length;
  const male = allSeats.filter((s) => s.status === "male").length;
  const female = allSeats.filter((s) => s.status === "female").length;
  const blocked = allSeats.filter((s) => s.status === "blocked").length;
  const available = totalSeats - booked - blocked;

  const seatCount = selected.length;
  const fare = seatCount * SEAT_FARE;
  const commission = Math.round(fare * COMMISSION_RATE);
  const net = fare - commission;

  return (
    <AgentShell title="New Booking">
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        {/* LEFT + CENTER */}
        <div className="space-y-5">
          <InventoryStatusBanner />
          {showConflict && <SeatConflictBanner onDismiss={() => setShowConflict(false)} />}
          <BookingSourceSelector value={bookingSource} onChange={setBookingSource} />
          {/* Journey info */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
              <div className="flex items-center gap-3 lg:col-span-2">
                <div>
                  <div className="text-lg font-bold text-foreground">Hyderabad</div>
                  <div className="text-xs font-medium text-muted-foreground">HYD</div>
                </div>
                <ArrowRight className="h-5 w-5 text-brand-green" />
                <div>
                  <div className="text-lg font-bold text-foreground">Bangalore</div>
                  <div className="text-xs font-medium text-muted-foreground">BLR</div>
                </div>
              </div>
              <InfoCell icon={Calendar} label="Journey Date" value="20 May 2025" hint="Tuesday" />
              <InfoCell icon={Bus} label="Bus" value="TS 09 AB 1234" hint="Volvo B11R · Sleeper (2+1)" />
              <InfoCell icon={Clock} label="Departure" value="08:00 PM" hint="20 May 2025" />
              <InfoCell icon={Clock} label="Arrival" value="06:00 AM" hint="21 May 2025" />
              <InfoCell icon={MapPin} label="Boarding Point" value="Ameerpet" hint="07:45 PM" />
            </div>
            <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
              Via: Anantapur, Dharmavaram
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <SummaryCard icon={Armchair} label="Total Seats" value={totalSeats} tint="bg-slate-100 text-slate-700" />
            <SummaryCard icon={CircleCheck} label="Available Seats" value={available} tint="bg-emerald-100 text-emerald-700" />
            <SummaryCard icon={CircleX} label="Booked Seats" value={booked} tint="bg-rose-100 text-rose-700" />
            <SummaryCard icon={Mars} label="Male Occupied" value={male} tint="bg-blue-100 text-blue-700" />
            <SummaryCard icon={Venus} label="Female Occupied" value={female} tint="bg-pink-100 text-pink-700" />
            <SummaryCard icon={Star} label="Selected Seats" value={seatCount} tint="bg-amber-100 text-amber-700" />
          </div>

          {/* Seat map + passenger details */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Select Seats ({deck === "lower" ? "Lower Deck" : "Upper Deck"})
                </h2>
                <p className="text-xs text-muted-foreground">
                  Click on seat to select. You can select multiple seats.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeck(deck === "lower" ? "upper" : "lower")}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Switch to {deck === "lower" ? "Upper" : "Lower"} Deck
                </button>
                <button className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted">
                  Refresh
                </button>
              </div>
            </div>

            <Legend />

            <div className="mt-4 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <BusSeatMap
                deckLabel={deck === "lower" ? "Lower Deck" : "Upper Deck"}
                seats={seats}
                selected={selected}
                onToggle={toggleSeat}
              />

              {/* Passenger details */}
              <div className="space-y-4 rounded-2xl border border-border bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Passenger Details</h3>
                </div>

                {selected.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                    Select a seat to add a passenger.
                  </div>
                )}

                {selected.map((sid, idx) => {
                  const p = passengers[sid];
                  if (!p) return null;
                  return (
                    <div
                      key={sid}
                      className="space-y-3 rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">
                          Passenger {idx + 1}{" "}
                          <span className="ml-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                            Seat {sid}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleSeat(sid)}
                          className="rounded-md p-1 text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Name">
                          <input
                            value={p.name}
                            onChange={(e) => updatePassenger(sid, { name: e.target.value })}
                            placeholder="Full name"
                            className="input"
                          />
                        </Field>
                        <Field label="Gender">
                          <select
                            value={p.gender}
                            onChange={(e) =>
                              updatePassenger(sid, {
                                gender: e.target.value as "Male" | "Female",
                              })
                            }
                            className="input"
                          >
                            <option>Male</option>
                            <option>Female</option>
                          </select>
                        </Field>
                        <Field label="Age">
                          <input
                            value={p.age}
                            onChange={(e) => updatePassenger(sid, { age: e.target.value })}
                            className="input"
                          />
                        </Field>
                        <Field label="Mobile Number">
                          <input
                            value={p.mobile}
                            onChange={(e) => updatePassenger(sid, { mobile: e.target.value })}
                            className="input"
                          />
                        </Field>
                        <Field label="ID Proof Type">
                          <select
                            value={p.idType}
                            onChange={(e) => updatePassenger(sid, { idType: e.target.value })}
                            className="input"
                          >
                            <option>Aadhaar Card</option>
                            <option>Voter ID</option>
                            <option>Driving License</option>
                            <option>Passport</option>
                          </select>
                        </Field>
                        <Field label="ID Proof Number">
                          <input
                            value={p.idNumber}
                            onChange={(e) => updatePassenger(sid, { idNumber: e.target.value })}
                            className="input"
                          />
                        </Field>
                      </div>
                    </div>
                  );
                })}

                {selected.length > 0 && (
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-green/50 py-2.5 text-sm font-medium text-brand-green hover:bg-brand-green/5">
                    <Plus className="h-4 w-4" />
                    Add Another Passenger
                  </button>
                )}
              </div>
            </div>

            {/* Boarding + dropping */}
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Field label="Boarding Point">
                <select className="input">
                  <option>Ameerpet — 07:45 PM</option>
                  <option>Kukatpally — 08:15 PM</option>
                  <option>MGBS — 08:45 PM</option>
                </select>
              </Field>
              <Field label="Dropping Point">
                <select className="input">
                  <option>Bangalore (Silk Board) — 06:00 AM</option>
                  <option>Madiwala — 05:30 AM</option>
                  <option>Majestic — 06:30 AM</option>
                </select>
              </Field>
              <Field label="Notes (Optional)">
                <input className="input" placeholder="Enter notes if any" />
              </Field>
            </div>
          </div>

          {/* Notes + Amenities */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="mb-3 text-sm font-semibold">Seat Legend</h3>
              <Legend compact />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="mb-3 text-sm font-semibold">Important Notes</h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>• Seat once booked cannot be changed.</li>
                <li>• Please check passenger details before generating ticket.</li>
                <li>• Carry valid ID proof during travel.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h3 className="mb-3 text-sm font-semibold">Bus Amenities</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <Amenity icon={PlugZap} label="Charging Point" />
                <Amenity icon={Droplet} label="Water Bottle" />
                <Amenity icon={Lightbulb} label="Reading Light" />
                <Amenity icon={Wind} label="Air Conditioner" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <aside className="space-y-5">
          <BookingValidationPanel
            routeOk
            seatsOk={seatCount > 0}
            fareOk={seatCount > 0}
            ticketReady={seatCount > 0}
          />

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-3 text-sm font-semibold">Booking Summary</h3>
            <SummaryRow label="Total Seats" value={totalSeats} />
            <SummaryRow label="Available Seats" value={available} className="text-emerald-600" />
            <SummaryRow label="Booked Seats" value={booked} className="text-rose-600" />
            <SummaryRow label="Male Occupied" value={male} className="text-blue-600" />
            <SummaryRow label="Female Occupied" value={female} className="text-pink-600" />
            <SummaryRow label="Selected Seats" value={seatCount} className="text-amber-600" />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-3 text-sm font-semibold">Selected Seats</h3>
            {selected.length === 0 ? (
              <p className="text-xs text-muted-foreground">No seats selected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selected.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSeat(s)}
                    className="inline-flex items-center gap-1 rounded-md bg-seat-selected/25 px-2 py-1 text-xs font-semibold text-amber-800 ring-1 ring-seat-selected"
                  >
                    {s}
                    <span className="text-amber-700/70">×</span>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
              <SummaryRow label="Total Seats" value={seatCount} />
              <SummaryRow label="Seat Fare (per seat)" value={`₹${SEAT_FARE.toLocaleString()}`} />
              <SummaryRow
                label="Total Fare"
                value={`₹${fare.toLocaleString()}`}
                className="font-semibold text-foreground"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-3 text-sm font-semibold">Payment Summary</h3>
            <SummaryRow label={`Ticket Fare (${seatCount} Seats)`} value={`₹${fare.toLocaleString()}`} />
            <SummaryRow
              label="Agent Commission (10%)"
              value={`- ₹${commission.toLocaleString()}`}
              className="text-emerald-600"
            />
            <div className="my-2 border-t border-border" />
            <SummaryRow
              label="Net Amount"
              value={`₹${net.toLocaleString()}`}
              className="text-base font-bold text-foreground"
            />
            <Field label="Payment Mode" className="mt-3">
              <select className="input">
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Wallet</option>
              </select>
            </Field>
            <button
              disabled={seatCount === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Ticket className="h-4 w-4" />
              Generate Ticket
            </button>
          </div>
        </aside>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-border);
          background: var(--color-card);
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          color: var(--color-foreground);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus {
          border-color: var(--color-brand-green);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-brand-green) 18%, transparent);
        }
      `}</style>
    </AgentShell>
  );
}

function InfoCell({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-semibold text-foreground">{value}</div>
        {hint && <div className="truncate text-[11px] text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Armchair;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-card">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tint}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="text-lg font-bold leading-none text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
}

function Legend({ compact = false }: { compact?: boolean }) {
  const items = [
    { color: "bg-seat-available", label: "Available" },
    { color: "bg-seat-male", label: "Booked (Male)" },
    { color: "bg-seat-female", label: "Booked (Female)" },
    { color: "bg-seat-selected", label: "Selected" },
    { color: "bg-seat-blocked", label: "Blocked" },
  ];
  return (
    <div className={`flex flex-wrap items-center ${compact ? "gap-3" : "gap-4"} text-xs`}>
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded ${i.color}`} />
          <span className="text-muted-foreground">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function SummaryRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium text-foreground ${className}`}>{value}</span>
    </div>
  );
}

function Amenity({ icon: Icon, label }: { icon: typeof PlugZap; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-brand-green" />
      <span>{label}</span>
    </div>
  );
}
