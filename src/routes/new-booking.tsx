import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  Bus,
  CalendarDays,
  CircleCheck,
  Clock,
  MapPin,
  Printer,
  RefreshCw,
  Snowflake,
  Ticket as TicketIcon,
  Trash2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { AgentShell } from "@/components/AgentShell";
import { BusSeatMap } from "@/components/booking/BusSeatMap";
import { BookingSourceSelector, type BookingSource } from "@/components/booking-source";
import { ApiError, errorMessage } from "@/lib/api/client";
import {
  bookingKeys,
  createBooking,
  findTrips,
  formatDay,
  formatTime,
  getMe,
  getSeats,
  ID_PROOFS,
  listRoutes,
  rupees,
  SEATING_LABEL,
  todayInIndia,
  ticketCode,
  type PassengerInput,
  type Seating,
  type Ticket,
  type TripOption,
} from "@/lib/api/booking";

export const Route = createFileRoute("/new-booking")({
  head: () => ({
    meta: [
      { title: "New Booking — KenRoute Agent Panel" },
      {
        name: "description",
        content: "Find a bus by date and route, pick seats and book tickets on KenRoute.",
      },
    ],
  }),
  component: NewBooking,
});

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/15 disabled:opacity-60";
const cardClass = "rounded-2xl border border-border bg-card p-5 shadow-card";

type PassengerForm = Omit<PassengerInput, "seatId" | "age"> & { age: string };

const emptyPassenger: PassengerForm = {
  name: "",
  age: "",
  gender: "MALE",
  phone: "",
  idProofType: "AADHAAR",
  idProofNumber: "",
};

const SOURCE_CODE: Record<BookingSource, "AGENT" | "COUNTER" | "PHONE" | "CORPORATE"> = {
  Agent: "AGENT",
  Counter: "COUNTER",
  Phone: "PHONE",
  Corporate: "CORPORATE",
};

function NewBooking() {
  const queryClient = useQueryClient();

  // Step 1: what the agent is looking for.
  const [date, setDate] = useState(todayInIndia);
  const [routeId, setRouteId] = useState("");
  const [seating, setSeating] = useState<Seating | "ALL">("ALL");
  // Step 2 onwards: the chosen bus and the booking being filled in.
  const [tripId, setTripId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Record<string, PassengerForm>>({});
  const [boardingPoint, setBoardingPoint] = useState("");
  const [droppingPoint, setDroppingPoint] = useState("");
  const [source, setSource] = useState<BookingSource>("Agent");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI">("CASH");
  const [notes, setNotes] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const routes = useQuery({ queryKey: bookingKeys.routes, queryFn: listRoutes });
  const me = useQuery({ queryKey: bookingKeys.me, queryFn: getMe });
  const trips = useQuery({
    queryKey: bookingKeys.trips(routeId, date, seating),
    queryFn: () => findTrips(routeId, date, seating),
    enabled: routeId !== "" && date !== "",
  });
  const seatMap = useQuery({
    queryKey: bookingKeys.seats(tripId),
    queryFn: () => getSeats(tripId),
    enabled: tripId !== "",
    // Other agents are selling the same bus, so keep the picture fresh.
    refetchInterval: 20_000,
  });

  const clearBooking = () => {
    setSelected([]);
    setPassengers({});
    setBoardingPoint("");
    setDroppingPoint("");
    setNotes("");
  };

  // Changing the search makes the chosen bus, and everything entered for it, meaningless.
  const changeSearch = (apply: () => void) => {
    apply();
    setTripId("");
    clearBooking();
  };

  const chooseTrip = (trip: TripOption) => {
    setTripId(trip.id);
    clearBooking();
  };

  const toggleSeat = (seatId: string) => {
    if (selected.includes(seatId)) {
      setSelected(selected.filter((id) => id !== seatId));
      return;
    }
    if (selected.length >= 6) {
      toast.error("One booking can hold at most 6 seats");
      return;
    }
    setSelected([...selected, seatId]);
    setPassengers((prev) => (prev[seatId] ? prev : { ...prev, [seatId]: emptyPassenger }));
  };

  const updatePassenger = (seatId: string, patch: Partial<PassengerForm>) =>
    setPassengers((prev) => ({
      ...prev,
      [seatId]: { ...(prev[seatId] ?? emptyPassenger), ...patch },
    }));

  const book = useMutation({
    mutationFn: () =>
      createBooking({
        tripId,
        source: SOURCE_CODE[source],
        boardingPoint,
        droppingPoint,
        paymentMode,
        ...(notes.trim() && { notes: notes.trim() }),
        passengers: selected.map((seatId) => {
          const p = passengers[seatId] ?? emptyPassenger;
          return {
            ...p,
            seatId,
            age: Number(p.age),
            name: p.name.trim(),
            idProofNumber: p.idProofNumber.trim(),
          };
        }),
      }),
    onSuccess: (result) => {
      setTicket(result);
      toast.success(`Booked. PNR ${result.pnr}`);
    },
    onError: (err) => {
      toast.error(errorMessage(err));
      // Someone else got a seat first: drop the selection so the agent picks from the fresh map.
      if (err instanceof ApiError && err.code === "SEAT_UNAVAILABLE") setSelected([]);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["booking"] }),
  });

  const startOver = () => {
    setTicket(null);
    setTripId("");
    clearBooking();
  };

  if (ticket) {
    return (
      <AgentShell title="New Booking">
        <TicketView ticket={ticket} onNew={startOver} />
      </AgentShell>
    );
  }

  const trip = trips.data?.find((t) => t.id === tripId) ?? seatMap.data?.trip;
  const seats = seatMap.data?.seats ?? [];
  const seatById = new Map(seats.map((s) => [s.id, s]));
  // A seat someone else booked since it was picked drops out of the selection.
  const chosen = selected.filter((id) => seatById.get(id)?.status === "AVAILABLE");
  const total = trip ? Number(trip.fare) * chosen.length : 0;
  const commissionPct = Number(me.data?.commissionPct ?? 0);

  return (
    <AgentShell title="New Booking">
      <div className="space-y-5">
        {/* Step 1: date, route, type */}
        <section className={cardClass}>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Find a Bus</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Journey Date">
              <input
                type="date"
                value={date}
                min={todayInIndia()}
                onChange={(e) => changeSearch(() => setDate(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label="Route">
              <select
                value={routeId}
                onChange={(e) => changeSearch(() => setRouteId(e.target.value))}
                disabled={routes.isPending}
                className={inputClass}
              >
                <option value="">{routes.isPending ? "Loading routes…" : "Select a route"}</option>
                {routes.data?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.origin} → {r.destination}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bus Type">
              <select
                value={seating}
                onChange={(e) => changeSearch(() => setSeating(e.target.value as Seating | "ALL"))}
                className={inputClass}
              >
                <option value="ALL">All types</option>
                {Object.entries(SEATING_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {routes.isError && <Notice tone="error">{errorMessage(routes.error)}</Notice>}
          {routes.data?.length === 0 && (
            <Notice>No routes yet. The owner adds routes in the Admin app.</Notice>
          )}
        </section>

        {/* Step 2: choose the bus */}
        <section className={cardClass}>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Choose a Bus</h2>
          {routeId === "" ? (
            <Notice>Select a date and a route to see the buses running that day.</Notice>
          ) : trips.isPending ? (
            <Notice>Looking for buses…</Notice>
          ) : trips.isError ? (
            <Notice tone="error">{errorMessage(trips.error)}</Notice>
          ) : trips.data.length === 0 ? (
            <Notice>No buses on this route for that date and type.</Notice>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {trips.data.map((t) => {
                const active = t.id === tripId;
                const full = t.availableSeats === 0;
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={full}
                    onClick={() => chooseTrip(t)}
                    aria-pressed={active}
                    className={`flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      active
                        ? "border-brand-green bg-brand-green/10 ring-1 ring-brand-green/40"
                        : "border-border bg-background hover:border-brand-green/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Bus className="h-4 w-4 text-brand-green" />
                        {t.bus.name ?? t.bus.registrationNo}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{t.bus.registrationNo}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                          {SEATING_LABEL[t.bus.seating]}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                          {t.bus.isAc && <Snowflake className="h-3 w-3" />}
                          {t.bus.isAc ? "AC" : "Non-AC"}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatTime(t.departureAt)} <ArrowRight className="h-3 w-3" />{" "}
                        {formatTime(t.arrivalAt)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Arrives {formatDay(t.arrivalAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-foreground">{rupees(t.fare)}</div>
                      <div
                        className={`text-[11px] font-medium ${full ? "text-rose-600" : "text-emerald-700"}`}
                      >
                        {full ? "Sold out" : `${t.availableSeats} of ${t.totalSeats} seats left`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Step 3: seats, passengers, stops */}
        {tripId !== "" && trip && (
          <form
            className="grid gap-5 xl:grid-cols-[1fr_20rem]"
            onSubmit={(e) => {
              e.preventDefault();
              book.mutate();
            }}
          >
            <div className="space-y-5">
              <section className={cardClass}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Select Seats</h2>
                    <p className="text-[11px] text-muted-foreground">
                      {trip.route.origin} → {trip.route.destination} · {formatDay(trip.departureAt)}
                      , {formatTime(trip.departureAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <SeatLegend />
                    <button
                      type="button"
                      onClick={() => seatMap.refetch()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${seatMap.isFetching ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </button>
                  </div>
                </div>

                {seatMap.isPending ? (
                  <Notice>Loading seat layout…</Notice>
                ) : seatMap.isError ? (
                  <Notice tone="error">{errorMessage(seatMap.error)}</Notice>
                ) : (
                  <div className="space-y-7 pt-2">
                    {(["LOWER", "UPPER"] as const).map((deck) => {
                      const deckSeats = seats.filter((s) => s.deck === deck);
                      if (deckSeats.length === 0) return null;
                      return (
                        <BusSeatMap
                          key={deck}
                          deckLabel={deck === "LOWER" ? "Lower Deck" : "Upper Deck"}
                          seats={deckSeats}
                          selected={chosen}
                          onToggle={toggleSeat}
                        />
                      );
                    })}
                  </div>
                )}
              </section>

              <section className={cardClass}>
                <h2 className="mb-3 text-sm font-semibold text-foreground">Passenger Details</h2>
                {chosen.length === 0 ? (
                  <Notice>Select one or more seats above to enter passenger details.</Notice>
                ) : (
                  <div className="space-y-3">
                    {chosen.map((seatId, index) => {
                      const p = passengers[seatId] ?? emptyPassenger;
                      const set = (patch: Partial<PassengerForm>) => updatePassenger(seatId, patch);
                      return (
                        <div
                          key={seatId}
                          className="space-y-3 rounded-xl border border-border bg-background p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">
                              Passenger {index + 1}
                              <span className="ml-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                                Seat {seatById.get(seatId)?.seatNumber}
                              </span>
                            </div>
                            <button
                              type="button"
                              aria-label="Remove this seat"
                              onClick={() => toggleSeat(seatId)}
                              className="rounded-md p-1 text-rose-500 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <Field label="Full Name">
                              <input
                                value={p.name}
                                onChange={(e) => set({ name: e.target.value })}
                                required
                                minLength={2}
                                maxLength={60}
                                placeholder="As on ID proof"
                                className={inputClass}
                              />
                            </Field>
                            <Field label="Age">
                              <input
                                value={p.age}
                                onChange={(e) => set({ age: e.target.value })}
                                required
                                type="number"
                                min={1}
                                max={120}
                                step={1}
                                className={inputClass}
                              />
                            </Field>
                            <Field label="Gender">
                              <select
                                value={p.gender}
                                onChange={(e) =>
                                  set({ gender: e.target.value as PassengerForm["gender"] })
                                }
                                className={inputClass}
                              >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </Field>
                            <Field label="Mobile Number">
                              <input
                                value={p.phone}
                                onChange={(e) =>
                                  set({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                                }
                                required
                                inputMode="numeric"
                                pattern="[6-9][0-9]{9}"
                                title="Enter a 10-digit mobile number"
                                placeholder="10-digit mobile number"
                                className={inputClass}
                              />
                            </Field>
                            <Field label="ID Proof Type">
                              <select
                                value={p.idProofType}
                                onChange={(e) =>
                                  set({
                                    idProofType: e.target.value as PassengerForm["idProofType"],
                                  })
                                }
                                className={inputClass}
                              >
                                {ID_PROOFS.map((id) => (
                                  <option key={id.value} value={id.value}>
                                    {id.label}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field label="ID Proof Number">
                              <input
                                value={p.idProofNumber}
                                onChange={(e) => set({ idProofNumber: e.target.value })}
                                required
                                pattern="[A-Za-z0-9 \-]{5,20}"
                                title="5 to 20 letters or digits"
                                className={inputClass}
                              />
                            </Field>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className={cardClass}>
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Boarding &amp; Dropping
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={`Boarding Point (${trip.route.origin})`}>
                    <StopPicker
                      value={boardingPoint}
                      onChange={setBoardingPoint}
                      stops={trip.route.boardingPoints}
                    />
                  </Field>
                  <Field label={`Dropping Point (${trip.route.destination})`}>
                    <StopPicker
                      value={droppingPoint}
                      onChange={setDroppingPoint}
                      stops={trip.route.droppingPoints}
                    />
                  </Field>
                  <Field label="Notes (optional)" className="md:col-span-2">
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={200}
                      placeholder="Anything the conductor should know"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </section>

              <BookingSourceSelector value={source} onChange={setSource} />
            </div>

            {/* Summary and confirm */}
            <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
              <section className={cardClass}>
                <h2 className="mb-3 text-sm font-semibold text-foreground">Booking Summary</h2>
                <dl className="space-y-2 text-sm">
                  <SummaryRow label="Bus" value={trip.bus.name ?? trip.bus.registrationNo} />
                  <SummaryRow
                    label="Departure"
                    value={`${formatDay(trip.departureAt)}, ${formatTime(trip.departureAt)}`}
                  />
                  <SummaryRow
                    label="Seats"
                    value={
                      chosen.map((id) => seatById.get(id)?.seatNumber).join(", ") || "None selected"
                    }
                  />
                  <SummaryRow label="Fare per seat" value={rupees(trip.fare)} />
                </dl>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm font-medium">Total to collect</span>
                  <span className="text-xl font-bold text-foreground">{rupees(total)}</span>
                </div>
                {commissionPct > 0 && (
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Your commission ({commissionPct}%)</span>
                    <span className="font-semibold text-emerald-700">
                      {rupees((total * commissionPct) / 100)}
                    </span>
                  </div>
                )}
              </section>

              <section className={cardClass}>
                <Field label="Payment Mode">
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as "CASH" | "UPI")}
                    className={inputClass}
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option disabled>Online payment — coming soon</option>
                  </select>
                </Field>
                <button
                  type="submit"
                  disabled={chosen.length === 0 || book.isPending}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TicketIcon className="h-4 w-4" />
                  {book.isPending ? "Booking…" : "Confirm Booking"}
                </button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Check passenger details first. A booked seat cannot be changed, only cancelled.
                </p>
              </section>
            </aside>
          </form>
        )}
      </div>
    </AgentShell>
  );
}

function TicketView({ ticket, onNew }: { ticket: Ticket; onNew: () => void }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 print:hidden">
        <CircleCheck className="h-6 w-6 shrink-0" />
        <div>
          <div className="text-sm font-semibold">Booking confirmed</div>
          <div className="text-xs">Passenger details are saved. Give the PNR to the passenger.</div>
        </div>
      </div>

      <section className={`print-area ${cardClass}`}>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-border pb-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              PNR
            </div>
            <div className="font-mono text-3xl font-bold tracking-widest text-foreground">
              {ticket.pnr}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">
              {ticket.trip.origin} → {ticket.trip.destination}
            </div>
            <div className="text-xs text-muted-foreground">
              {ticket.trip.bus.name ?? ""} · {ticket.trip.bus.registrationNo}
            </div>
          </div>
        </div>

        <dl className="grid gap-4 py-4 text-sm sm:grid-cols-2">
          <TicketFact icon={CalendarDays} label="Departure">
            {formatDay(ticket.trip.departureAt)}, {formatTime(ticket.trip.departureAt)}
          </TicketFact>
          <TicketFact icon={Clock} label="Arrival">
            {formatDay(ticket.trip.arrivalAt)}, {formatTime(ticket.trip.arrivalAt)}
          </TicketFact>
          <TicketFact icon={MapPin} label="Boarding Point">
            {ticket.boardingPoint}
          </TicketFact>
          <TicketFact icon={MapPin} label="Dropping Point">
            {ticket.droppingPoint}
          </TicketFact>
        </dl>

        <table className="w-full border-t border-border text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 font-medium">Passenger</th>
              <th className="py-2 font-medium">Seat</th>
              <th className="py-2 text-right font-medium">Fare</th>
            </tr>
          </thead>
          <tbody>
            {ticket.bookings.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="py-2 font-medium">{b.passengerName}</td>
                <td className="py-2">{b.seatNumber}</td>
                <td className="py-2 text-right">{rupees(b.fare)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={2} className="py-2 font-semibold">
                Total paid
              </td>
              <td className="py-2 text-right text-base font-bold">{rupees(ticket.totalFare)}</td>
            </tr>
          </tfoot>
        </table>

        {/* One code per passenger: the conductor scans it at boarding. */}
        <div className="mt-4 grid gap-3 border-t border-dashed border-border pt-4 sm:grid-cols-2">
          {ticket.bookings.map((b) => {
            const code = ticketCode(ticket.pnr, b.seatNumber);
            return (
              <div
                key={b.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <QRCodeSVG value={code} size={88} level="M" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {b.passengerName}
                  </div>
                  <div className="text-xs text-muted-foreground">Seat {b.seatNumber}</div>
                  <div className="mt-1 font-mono text-xs font-bold tracking-wider text-foreground">
                    {code}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Show this code to the conductor. Carry a valid ID proof while travelling.
        </p>
      </section>

      <div className="flex gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted"
        >
          <Printer className="h-4 w-4" /> Print Ticket
        </button>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-semibold text-white hover:bg-brand-green-dark"
        >
          <TicketIcon className="h-4 w-4" /> New Booking
        </button>
      </div>
    </div>
  );
}

function StopPicker({
  value,
  onChange,
  stops,
}: {
  value: string;
  onChange: (v: string) => void;
  stops: string[];
}) {
  // Routes saved without stops still need one written down for the conductor.
  if (stops.length === 0) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        maxLength={80}
        placeholder="Enter the stop"
        className={inputClass}
      />
    );
  }
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className={inputClass}
    >
      <option value="">Select a stop</option>
      {stops.map((stop) => (
        <option key={stop} value={stop}>
          {stop}
        </option>
      ))}
    </select>
  );
}

function SeatLegend() {
  const items = [
    ["Available", "bg-seat-available"],
    ["Booked (Male)", "bg-seat-male"],
    ["Booked (Female)", "bg-seat-female"],
    ["Selected", "bg-seat-selected"],
    ["Blocked", "bg-seat-blocked"],
  ] as const;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map(([label, color]) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

function Notice({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "error";
}) {
  return (
    <p
      className={`mt-1 rounded-xl border border-dashed px-4 py-6 text-center text-sm ${
        tone === "error"
          ? "border-rose-300 bg-rose-50 text-rose-700"
          : "border-border text-muted-foreground"
      }`}
    >
      {children}
    </p>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

function TicketFact({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 text-brand-green" />
      <div>
        <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="font-medium text-foreground">{children}</dd>
      </div>
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
