import { api } from "./client";

export const SUPPORT_CATEGORIES = [
  "Booking Issues",
  "Payment Issues",
  "Ticket Problems",
  "Route Queries",
  "Technical Support",
] as const;

export interface SupportTicket {
  id: string;
  /** Short number to quote, like "SUP3F9A1C". */
  ticketNo: string;
  subject: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "PENDING" | "RESOLVED";
  pnr: string | null;
  createdAt: string;
}

export interface NewSupportTicket {
  subject: string;
  category: (typeof SUPPORT_CATEGORIES)[number];
  priority: SupportTicket["priority"];
  pnr?: string;
  description: string;
}

export const supportKey = ["support", "tickets"] as const;

export const listSupportTickets = () =>
  api<{ items: SupportTicket[] }>("/support/tickets").then((r) => r.items);

/** `emailed` is false when the ticket was saved but the copy to the support inbox did not go out. */
export const createSupportTicket = (body: NewSupportTicket) =>
  api<SupportTicket & { emailed: boolean }>("/support/tickets", { method: "POST", body });
