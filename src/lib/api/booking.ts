import { api } from "./client";

export type Seating = "SLEEPER" | "SEATER" | "SEATER_SLEEPER";

export const SEATING_LABEL: Record<Seating, string> = {
  SLEEPER: "Sleeper",
  SEATER: "Seater",
  SEATER_SLEEPER: "Seater / Sleeper",
};

export interface RouteOption {
  id: string;
  origin: string;
  destination: string;
  boardingPoints: string[];
  droppingPoints: string[];
}

/** One bus on one route at one date and time. */
export interface TripOption {
  id: string;
  departureAt: string;
  arrivalAt: string;
  /** Lowest seat fare on the trip, as a decimal string. */
  fare: string;
  route: RouteOption;
  bus: { registrationNo: string; name: string | null; isAc: boolean; seating: Seating };
  totalSeats: number;
  availableSeats: number;
}

export interface TripSeat {
  id: string;
  seatNumber: string;
  deck: "LOWER" | "UPPER";
  row: number;
  col: number;
  seatType: string;
  status: "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED";
  /** Set for booked seats only; used for the seat colour. */
  passengerGender: "MALE" | "FEMALE" | "OTHER" | null;
  /** What this seat costs on this trip, as a decimal string. */
  fare: string;
}

export const ID_PROOFS = [
  { value: "AADHAAR", label: "Aadhaar Card" },
  { value: "VOTER_ID", label: "Voter ID" },
  { value: "DRIVING_LICENCE", label: "Driving Licence" },
  { value: "PAN", label: "PAN Card" },
  { value: "PASSPORT", label: "Passport" },
] as const;

export interface PassengerInput {
  seatId: string;
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone: string;
  idProofType: (typeof ID_PROOFS)[number]["value"];
  idProofNumber: string;
}

export interface BookingInput {
  tripId: string;
  source: "AGENT" | "COUNTER" | "PHONE" | "CORPORATE";
  boardingPoint: string;
  droppingPoint: string;
  paymentMode: "CASH" | "UPI";
  notes?: string;
  passengers: PassengerInput[];
}

export interface Ticket {
  pnr: string;
  totalFare: string;
  commission: string;
  boardingPoint: string;
  droppingPoint: string;
  trip: {
    id: string;
    origin: string;
    destination: string;
    departureAt: string;
    arrivalAt: string;
    bus: { registrationNo: string; name: string | null };
  };
  bookings: { id: string; seatNumber: string; fare: string; passengerName: string }[];
}

export const bookingKeys = {
  routes: ["booking", "routes"] as const,
  trips: (routeId: string, date: string, seating: string) =>
    ["booking", "trips", routeId, date, seating] as const,
  seats: (tripId: string) => ["booking", "seats", tripId] as const,
  me: ["me"] as const,
};

export const listRoutes = () =>
  api<{ items: RouteOption[] }>("/booking/routes").then((r) => r.items);

export const findTrips = (routeId: string, date: string, seating: Seating | "ALL") =>
  api<{ items: TripOption[] }>(
    `/booking/trips?routeId=${routeId}&date=${date}${seating === "ALL" ? "" : `&seating=${seating}`}`,
  ).then((r) => r.items);

export const getSeats = (tripId: string) =>
  api<{ trip: TripOption; seats: TripSeat[] }>(`/booking/trips/${tripId}/seats`);

export const createBooking = (body: BookingInput) =>
  api<Ticket>("/booking/bookings", { method: "POST", body });

/** The signed-in agent, including their commission percentage. */
export const getMe = () => api<{ name: string; agentCode?: string; commissionPct?: string }>("/me");

const IST = "Asia/Kolkata";
const timeFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST,
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});
const dayFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST,
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const formatTime = (iso: string) => timeFmt.format(new Date(iso));
export const formatDay = (iso: string) => dayFmt.format(new Date(iso));
export const rupees = (amount: string | number) =>
  `₹${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/** Today's date in India as YYYY-MM-DD, for date inputs. */
export const todayInIndia = () => new Date().toLocaleDateString("en-CA", { timeZone: IST });

// --- The agent's own bookings, for Tickets, Booking History and Passengers ---

export interface MyBooking {
  id: string;
  pnr: string;
  status: "CREATED" | "CONFIRMED" | "BOARDED" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  source: "AGENT" | "COUNTER" | "PHONE" | "CORPORATE" | "OTA";
  fare: string;
  paymentMode: "CASH" | "UPI" | null;
  boardingPoint: string | null;
  droppingPoint: string | null;
  createdAt: string;
  seatNumber: string;
  trip: {
    departureAt: string;
    arrivalAt: string;
    route: { origin: string; destination: string };
    bus: { registrationNo: string; name: string | null };
  };
  passenger: {
    name: string;
    age: number | null;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    phone: string;
  } | null;
}

export const myBookingsKey = ["booking", "mine"] as const;

export const listMyBookings = () =>
  api<{ items: MyBooking[] }>("/booking/bookings").then((r) => r.items);

const shortDateFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST,
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const clockFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "07 Oct 2026" */
export const shortDate = (iso: string) => shortDateFmt.format(new Date(iso));
/** "20:00" */
export const clock = (iso: string) => clockFmt.format(new Date(iso));

const SOURCE_NAME = {
  AGENT: "Agent",
  COUNTER: "Counter",
  PHONE: "Phone",
  CORPORATE: "Corporate",
  OTA: "Agent",
} as const;

/**
 * What a ticket's QR code holds: the PNR plus the seat, so every ticket in a group
 * booking is different. It carries no personal details. The conductor app looks
 * this code up in its passenger list.
 */
export const ticketCode = (pnr: string, seat: string) => `${pnr}-${seat}`;

export const cancelBooking = (bookingId: string) =>
  api<{ id: string; status: string }>(`/booking/bookings/${bookingId}/cancel`, { method: "POST" });

type Shareable = {
  pnr: string;
  passenger: string;
  route: string;
  date: string;
  departure: string;
  bus: string;
  seat: string;
  boarding: string;
  fare: number;
};

function ticketText(t: Shareable) {
  return [
    `KenRoute e-ticket`,
    `PNR: ${t.pnr}`,
    `Passenger: ${t.passenger}`,
    `${t.route}`,
    `${t.date}, ${t.departure}`,
    `Bus: ${t.bus} | Seat: ${t.seat}`,
    `Boarding: ${t.boarding}`,
    `Fare: Rs ${t.fare}`,
    `Carry a valid ID proof while travelling.`,
  ].join("\n");
}

/** Opens WhatsApp with the ticket typed out, addressed to the passenger when their number is known. */
export function whatsappLink(t: Shareable & { mobile: string }) {
  const digits = t.mobile.replace(/\D/g, "");
  return `https://wa.me/${digits.length >= 10 ? digits : ""}?text=${encodeURIComponent(ticketText(t))}`;
}

/** Opens the mail app with the ticket typed out. */
export function mailLink(t: Shareable & { email: string }) {
  const to = t.email.includes("@") ? t.email : "";
  return `mailto:${to}?subject=${encodeURIComponent(`Your KenRoute ticket ${t.pnr}`)}&body=${encodeURIComponent(ticketText(t))}`;
}

/** A booking laid out the way the list screens show one row. */
export function bookingView(b: MyBooking) {
  const { origin, destination } = b.trip.route;
  const departure = clock(b.trip.departureAt);
  const arrival = clock(b.trip.arrivalAt);
  const phone = b.passenger?.phone ?? "";
  return {
    bookingId: b.id,
    qr: ticketCode(b.pnr, b.seatNumber),
    ticketNo: `TKT${b.id.slice(0, 6).toUpperCase()}`,
    pnr: b.pnr,
    passenger: b.passenger?.name ?? "—",
    gender: b.passenger?.gender === "FEMALE" ? ("F" as const) : ("M" as const),
    age: b.passenger?.age ?? 0,
    phone,
    mobile: phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : "—",
    route: `${origin} → ${destination}`,
    from: origin,
    to: destination,
    boarding: `${b.boardingPoint ?? origin} · ${departure}`,
    dropping: `${b.droppingPoint ?? destination} · ${arrival}`,
    seat: b.seatNumber,
    date: shortDate(b.trip.departureAt),
    bus: b.trip.bus.registrationNo,
    departure,
    arrival,
    amount: Number(b.fare),
    issuedAt: `${shortDate(b.createdAt)} · ${clock(b.createdAt)}`,
    source: SOURCE_NAME[b.source],
    status: b.status,
  };
}
