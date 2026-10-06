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
  /** Decimal string, per seat. */
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
