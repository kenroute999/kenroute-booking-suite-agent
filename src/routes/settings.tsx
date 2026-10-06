import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AgentShell } from "@/components/AgentShell";
import {
  User,
  Shield,
  Bell,
  Printer,
  Palette,
  Languages,
  Camera,
  Smartphone,
  Mail,
  Lock,
  KeyRound,
  Monitor,
  Sun,
  Moon,
  Check,
  QrCode,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "tickets", label: "Ticket Preferences", icon: Printer },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "language", label: "Language", icon: Languages },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? "bg-brand-green" : "bg-muted"}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-4 last:border-0">
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {desc && <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SectionCard({ title, desc, icon: Icon, children }: { title: string; desc: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="rounded-lg bg-brand-green/10 p-2"><Icon className="h-4 w-4 text-brand-green" /></div>
        <div>
          <div className="text-base font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const [active, setActive] = useState<SectionId>("profile");
  const [sms, setSms] = useState(true);
  const [emailN, setEmailN] = useState(true);
  const [bookingAlert, setBookingAlert] = useState(true);
  const [twoFA, setTwoFA] = useState(true);
  const [autoDownload, setAutoDownload] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [lang, setLang] = useState("en");
  const [printFmt, setPrintFmt] = useState("A4");

  return (
    <AgentShell title="Settings">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar nav */}
        <nav className="h-fit rounded-2xl border border-border bg-card p-2 shadow-sm">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-green/10 font-semibold text-brand-green"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-6">
          {active === "profile" && (
            <SectionCard title="Profile Settings" desc="Update your personal information" icon={User}>
              <div className="flex items-center gap-5 border-b border-border py-5">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-green text-2xl font-bold text-white">A</div>
                  <button className="absolute -bottom-1 -right-1 rounded-full bg-foreground p-1.5 text-background ring-2 ring-card">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Profile Picture</div>
                  <div className="text-xs text-muted-foreground">PNG or JPG, max 2 MB</div>
                  <div className="mt-2 flex gap-2">
                    <button className="h-8 rounded-md bg-brand-green px-3 text-xs font-semibold text-white hover:opacity-90">Upload</button>
                    <button className="h-8 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-muted">Remove</button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 py-5 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Full Name</label>
                  <input className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue="Anil Kumar Reddy" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Agent ID</label>
                  <input disabled className="mt-1 h-10 w-full rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground" defaultValue="AGT1024" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground"><Smartphone className="mr-1 inline h-3 w-3" />Mobile Number</label>
                  <input className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground"><Mail className="mr-1 inline h-3 w-3" />Email Address</label>
                  <input className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue="anil.kumar@kenroute.in" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pb-5 pt-2">
                <button className="h-9 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-muted">Cancel</button>
                <button className="h-9 rounded-md bg-brand-green px-4 text-sm font-semibold text-white hover:opacity-90">Save Changes</button>
              </div>
            </SectionCard>
          )}

          {active === "security" && (
            <SectionCard title="Security Settings" desc="Protect your account and sessions" icon={Shield}>
              <div className="py-2">
                <div className="border-b border-border py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Lock className="h-4 w-4" /> Change Password</div>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <input type="password" placeholder="Current password" className="h-10 rounded-md border border-input bg-background px-3 text-sm" />
                    <input type="password" placeholder="New password" className="h-10 rounded-md border border-input bg-background px-3 text-sm" />
                    <input type="password" placeholder="Confirm password" className="h-10 rounded-md border border-input bg-background px-3 text-sm" />
                  </div>
                  <button className="mt-3 h-9 rounded-md bg-brand-green px-4 text-sm font-semibold text-white hover:opacity-90">Update Password</button>
                </div>
                <Row title="Two-Factor Authentication" desc="Adds an extra layer of security via OTP">
                  <div className="flex items-center gap-3">
                    {twoFA && <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/15 px-2 py-0.5 text-[11px] font-semibold text-brand-green"><Check className="h-3 w-3" /> Enabled</span>}
                    <Toggle on={twoFA} onChange={setTwoFA} />
                  </div>
                </Row>
                <div className="py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><KeyRound className="h-4 w-4" /> Recent Login Activity</div>
                  <div className="mt-3 space-y-2">
                    {[
                      { device: "Chrome on Windows · Hyderabad, IN", time: "Active now", current: true },
                      { device: "Safari on iPhone · Hyderabad, IN", time: "31 May 2026, 09:12 AM" },
                      { device: "Chrome on Android · Vijayawada, IN", time: "29 May 2026, 06:42 PM" },
                    ].map((l) => (
                      <div key={l.device} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
                        <div>
                          <div className="font-medium text-foreground">{l.device}</div>
                          <div className="text-[11px] text-muted-foreground">{l.time}</div>
                        </div>
                        {l.current
                          ? <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-[10px] font-semibold text-brand-green">This device</span>
                          : <button className="text-[11px] font-semibold text-rose-600 hover:underline">Revoke</button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {active === "notifications" && (
            <SectionCard title="Notification Settings" desc="Choose what updates you receive" icon={Bell}>
              <Row title="SMS Notifications" desc="Booking updates via SMS"><Toggle on={sms} onChange={setSms} /></Row>
              <Row title="Email Notifications" desc="Daily reports & important alerts"><Toggle on={emailN} onChange={setEmailN} /></Row>
              <Row title="Booking Alerts" desc="Instant alerts for new bookings & cancellations"><Toggle on={bookingAlert} onChange={setBookingAlert} /></Row>
            </SectionCard>
          )}

          {active === "tickets" && (
            <SectionCard title="Ticket Preferences" desc="Configure how tickets are printed and delivered" icon={Printer}>
              <Row title="Default Print Format" desc="Paper size for printed tickets">
                <select value={printFmt} onChange={(e) => setPrintFmt(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                  <option value="Thermal">Thermal (80mm)</option>
                </select>
              </Row>
              <Row title="Auto Ticket Download" desc="Automatically download PDF after booking"><Toggle on={autoDownload} onChange={setAutoDownload} /></Row>
              <Row title="QR Code on Tickets" desc="Include QR code for boarding scan">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-green">
                  <QrCode className="h-4 w-4" /> Always include
                </div>
              </Row>
              <Row title="Default Delivery Channel" desc="How tickets are shared with passengers">
                <select className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option>WhatsApp + Email</option>
                  <option>SMS only</option>
                  <option>Email only</option>
                  <option>Print only</option>
                </select>
              </Row>
              <div className="flex justify-end gap-2 py-4">
                <button className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-muted">
                  <Download className="h-3.5 w-3.5" /> Download Sample
                </button>
              </div>
            </SectionCard>
          )}

          {active === "theme" && (
            <SectionCard title="Theme Settings" desc="Customize the look of your panel" icon={Palette}>
              <div className="grid grid-cols-3 gap-3 py-5">
                {[
                  { id: "light", label: "Light Mode", icon: Sun },
                  { id: "dark", label: "Dark Mode", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = theme === t.id;
                  return (
                    <button key={t.id} onClick={() => setTheme(t.id as typeof theme)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        isActive ? "border-brand-green bg-brand-green/5" : "border-border hover:border-brand-green/30"
                      }`}>
                      <div className={`mb-3 flex h-20 items-center justify-center rounded-lg ${
                        t.id === "dark" ? "bg-sidebar" : t.id === "system" ? "bg-gradient-to-r from-white via-white to-sidebar" : "bg-white"
                      } border border-border`}>
                        <Icon className={`h-6 w-6 ${t.id === "dark" ? "text-white" : "text-foreground"}`} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{t.label}</span>
                        {isActive && <Check className="h-4 w-4 text-brand-green" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {active === "language" && (
            <SectionCard title="Language Settings" desc="Select your preferred language" icon={Languages}>
              <div className="space-y-2 py-4">
                {[
                  { id: "en", label: "English", native: "English" },
                  { id: "te", label: "Telugu", native: "తెలుగు" },
                  { id: "hi", label: "Hindi", native: "हिन्दी" },
                ].map((l) => {
                  const isActive = lang === l.id;
                  return (
                    <button key={l.id} onClick={() => setLang(l.id)}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                        isActive ? "border-brand-green bg-brand-green/5" : "border-border hover:border-brand-green/30"
                      }`}>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{l.label}</div>
                        <div className="text-xs text-muted-foreground">{l.native}</div>
                      </div>
                      {isActive && <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-white"><Check className="h-3.5 w-3.5" /></div>}
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </AgentShell>
  );
}
