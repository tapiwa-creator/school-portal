import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Circle, Book, MapPin, CheckCircle, Bell, Home, Settings, Rocket, BookOpen, Library, MessageSquare, Phone, HelpCircle } from "lucide-react";

// ── Font: DM Sans — same as all portal modules ────────────────────────────────
const FONT = "'DM Sans', system-ui, sans-serif";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const C = {
  greenDark: "#0d2818",
  greenMid: "#1a4d2a",
  greenAccent: "#2d6e3e",
  greenLight: "#e8f5ee",
  greenPale: "#f4fbf7",
  gold: "#c8a84b",
  border: "#d4e6da",
  textDark: "#111",
  textMid: "#444",
  textLight: "#888",
  white: "#fff",
  red: "#e74c3c",
  amber: "#f59e0b",
};

// ── Guide data ────────────────────────────────────────────────────────────────
const GUIDES = [
  {
    id: "getting-started",
    icon: <Rocket className="w-5 h-5" />,
    title: "Getting Started",
    desc: "Set up your account and log in for the first time",
    steps: [
      { title: "Receive your login credentials", body: "After your child's admission is confirmed, you will receive a welcome email from admissions@cornerstone.edu containing your unique username and a temporary password." },
      { title: "Visit the portal", body: 'Open your web browser (Chrome, Firefox, Edge or Safari) and navigate to the Corner Stone portal URL provided in your welcome email. Click the green "Log In" button in the top-right corner of the homepage.' },
      { title: "Enter your credentials", body: "Type your username and the temporary password exactly as provided in the welcome email. Passwords are case-sensitive. Click the blue 'Sign In' button to continue." },
      { title: "Change your password", body: "On first login you will be prompted to create a new password. Your password must be at least 8 characters long and contain at least one number and one uppercase letter. Confirm the new password and click 'Save'." },
      { title: "Complete your profile", body: "Navigate to 'My Profile' using the menu on the left side of the screen. Fill in any missing contact details and upload a profile photo if you wish. Click 'Save Profile' when done." },
    ],
  },
  {
    id: "dashboard",
    icon: <Home className="w-5 h-5" />,
    title: "Navigating the Dashboard",
    desc: "Understand every section of your home screen",
    steps: [
      { title: "Overview cards", body: "The four cards at the top of the dashboard show your child's attendance rate, current grade average, upcoming assignments, and unread messages at a glance." },
      { title: "Left navigation menu", body: "The dark-green sidebar on the left gives you access to all main sections: Dashboard, Academics, Timetable, Fee Payments, Messages, and Settings. Click any item to navigate to that section." },
      { title: "Notifications bell", body: "The bell icon () in the top-right header shows alerts such as new results, fee reminders, and announcements. A red dot means you have unread notifications. Click it to expand the notification panel." },
      { title: "Quick-action buttons", body: "Below the overview cards you will find Quick Actions — shortcuts to Submit Assignment, Pay Fees, Message a Teacher, and Download Report. These are the most commonly used functions." },
      { title: "Announcements feed", body: "The right column shows school-wide announcements in chronological order. Click any announcement card to read the full message." },
    ],
  },
  {
    id: "academics",
    icon: <Library className="w-5 h-5" />,
    title: "Academics & Results",
    desc: "View grades, assignments, and academic reports",
    steps: [
      { title: "Viewing term results", body: "Go to Academics → Results in the left menu. Select the term from the dropdown at the top of the page. Your child's results for each subject will appear in a table showing the raw mark, percentage, and grade letter." },
      { title: "Downloading your report card", body: "On the Results page, click the green 'Download Report Card' button at the top-right. The report card will download as a PDF file to your device's default downloads folder." },
      { title: "Checking assignments", body: "Go to Academics → Assignments. Assignments are listed with their due date, subject, and submission status. Overdue assignments appear in red; submitted ones show a green tick." },
      { title: "Submitting an assignment", body: "Click on the assignment title, then click 'Submit Work'. Attach the required file (PDF or Word document) and add any notes for the teacher. Click 'Submit' to send. You will receive a confirmation notification." },
      { title: "Viewing the timetable", body: "Go to Academics → Timetable. The weekly class schedule is displayed as a colour-coded grid. Click any class block to see the room number, teacher name, and any notes for that lesson." },
    ],
  },
  {
    id: "fees",
    icon: <CreditCard className="w-5 h-5" />,
    title: "Fee Payments",
    desc: "Pay school fees and download receipts online",
    steps: [
      { title: "Checking your fee balance", body: "Go to Fee Payments in the left menu. The balance due for the current term is shown at the top of the page in a highlighted card. Outstanding amounts from previous terms, if any, appear below." },
      { title: "Making a payment", body: "Click the 'Pay Now' button. Enter the amount you wish to pay (you may pay in instalments if the school allows it). Select your payment method: EcoCash, Visa/Mastercard, or Bank Transfer. Follow the on-screen prompts to complete payment." },
      { title: "Downloading a receipt", body: "After a successful payment, click 'View Receipt'. The receipt will open as a PDF. Use the download icon at the top-right of the PDF viewer to save it to your device." },
      { title: "Payment history", body: "All previous payments are listed under the 'Payment History' tab on the Fee Payments page, with date, amount, reference number, and status. You can download any past receipt from this list." },
      { title: "Payment issues", body: "If your payment goes through on your bank but does not reflect on the portal within 30 minutes, do not pay again. Contact the accounts office at fees@cornerstone.edu or call +263 4 123 4569 with your bank reference number." },
    ],
  },
  {
    id: "messages",
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Messaging & Communication",
    desc: "Contact teachers and the school office securely",
    steps: [
      { title: "Sending a message to a teacher", body: "Go to Messages → New Message. In the 'To' field, start typing the teacher's name and select them from the dropdown list. Type your subject and message body, then click 'Send'. Teachers typically respond within 24 hours on school days." },
      { title: "Replying to a message", body: "Open any received message from the inbox. Click the 'Reply' button at the bottom of the message. Type your reply and click 'Send Reply'. The entire conversation thread is kept together for easy reference." },
      { title: "Contacting the admin office", body: "For administrative matters (attendance queries, fee queries, general school info), use the pre-built contact shortcut: Messages → New Message → select 'Admin Office' from the recipient dropdown." },
      { title: "Message notifications", body: "You will receive an email notification at your registered email address whenever you receive a new message in the portal. You can turn this off under Settings → Notification Preferences." },
    ],
  },
  {
    id: "account",
    icon: <Settings className="w-5 h-5" />,
    title: "Account & Settings",
    desc: "Manage your profile, password, and preferences",
    steps: [
      { title: "Updating contact details", body: "Go to Settings → My Profile. You can update your phone number, email address, and physical address. Click 'Save Changes' at the bottom. Note: your username cannot be changed — contact IT support if you need this updated." },
      { title: "Changing your password", body: "Go to Settings → Security. Enter your current password, then type and confirm your new password. Your new password must meet the complexity requirements shown on screen. Click 'Update Password'." },
      { title: "Notification preferences", body: "Go to Settings → Notifications. Toggle on or off the types of alerts you want to receive: new results, fee reminders, school announcements, and teacher messages. Changes are saved automatically." },
      { title: "Logging out", body: "Always log out when using a shared or public device. Click your name or avatar in the top-right corner and select 'Log Out' from the dropdown menu. The portal will redirect you to the login page." },
      { title: "Forgotten password", body: "On the login page, click 'Forgot Password?' below the sign-in button. Enter your registered email address and click 'Send Reset Link'. Check your inbox for a reset email and follow the link within 30 minutes." },
    ],
  },
];

const FAQ_ITEMS = [
  { q: "I can't log in — what do I do?", a: "First, check that your username and password are typed correctly (they are case-sensitive). If you have forgotten your password, click 'Forgot Password?' on the login page. If you still cannot log in after resetting your password, contact IT Support." },
  { q: "My child's results are not showing", a: "Results are published by the class teacher after marking is complete, usually within one week of the end of a term. If results are not visible more than two weeks after term end, contact the academic office." },
  { q: "My payment went through but the portal still shows an outstanding balance", a: "Bank transfers can take up to one business day to reflect. For card and EcoCash payments, allow up to 30 minutes. If the balance has not updated after these timeframes, email fees@cornerstone.edu with your payment reference number." },
  { q: "Can I use the portal on my phone?", a: "Yes. The portal is fully responsive and works on smartphones and tablets using your mobile browser. There is no app to download — simply open your browser and visit the portal URL." },
  { q: "How do I add a second parent or guardian account?", a: "A second parent/guardian account can be created by the school admin. Contact the school office with the guardian's full name and email address. They will receive their own login credentials separately." },
  { q: "I accidentally submitted the wrong assignment file", a: "Contact the subject teacher immediately via the Messaging section. The teacher can unlock the submission to allow you to re-upload the correct file before the deadline." },
];

// ── Small components ──────────────────────────────────────────────────────────
function GuideCard({ guide, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left",
      background: active ? C.greenDark : C.white,
      border: `1.5px solid ${active ? C.greenDark : C.border}`,
      borderRadius: 12, padding: "14px 18px", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 14,
      transition: "all .2s", fontFamily: FONT,
      boxShadow: active ? "0 4px 16px rgba(13,40,24,0.2)" : "none",
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{guide.icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: active ? C.white : C.textDark, fontFamily: FONT }}>{guide.title}</div>
        <div style={{ fontSize: 12, color: active ? "rgba(255,255,255,0.65)" : C.textLight, marginTop: 2, fontFamily: FONT }}>{guide.desc}</div>
      </div>
    </button>
  );
}

function StepAccordion({ step, idx, open, onToggle }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 10, boxShadow: open ? "0 2px 12px rgba(13,40,24,0.08)" : "none" }}>
      <button onClick={onToggle} style={{
        width: "100%", background: open ? C.greenLight : C.white,
        border: "none", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer", fontFamily: FONT, textAlign: "left", transition: "background .2s",
      }}>
        <span style={{ width: 28, height: 28, borderRadius: "50%", background: open ? C.greenDark : C.border, color: open ? C.white : C.textLight, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: FONT }}>
          {idx + 1}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: open ? C.greenDark : C.textDark, flex: 1, fontFamily: FONT }}>{step.title}</span>
        <span style={{ fontSize: 18, color: C.textLight, transform: open ? "rotate(180deg)" : "none", transition: "transform .25s" }}>⌄</span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 18px 62px", fontSize: 14, color: C.textMid, lineHeight: 1.75, fontFamily: FONT, animation: "fadeDown .2s ease" }}>
          {step.body}
        </div>
      )}
    </div>
  );
}

function FaqItem({ item, open, onToggle }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 10, boxShadow: open ? "0 2px 12px rgba(13,40,24,0.07)" : "none" }}>
      <button onClick={onToggle} style={{ width: "100%", background: open ? C.greenLight : C.white, border: "none", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, cursor: "pointer", fontFamily: FONT, textAlign: "left" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: open ? C.greenDark : C.textDark, fontFamily: FONT }}>{item.q}</span>
        <span style={{ fontSize: 18, color: C.textLight, flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .25s" }}>⌄</span>
      </button>
      {open && (
        <div style={{ padding: "0 22px 18px", fontSize: 14, color: C.textMid, lineHeight: 1.75, fontFamily: FONT, animation: "fadeDown .2s ease" }}>{item.a}</div>
      )}
    </div>
  );
}

function ContactCard({ icon, title, subtitle, value, action, actionLabel, color }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 6, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: color }} />
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.textDark, fontFamily: FONT }}>{title}</div>
      <div style={{ fontSize: 12, color: C.textLight, fontFamily: FONT }}>{subtitle}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.greenDark, marginTop: 4, fontFamily: FONT }}>{value}</div>
      {actionLabel && (
        <a href={action} style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.greenAccent, textDecoration: "none", fontFamily: FONT }}>
          {actionLabel} →
        </a>
      )}
    </div>
  );
}

// ── Ticket form ───────────────────────────────────────────────────────────────
function TicketForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", category: "", priority: "Medium", subject: "", message: "" });
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle = {
    border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px",
    fontSize: 14, width: "100%", fontFamily: FONT,
    color: C.textDark, background: "#fafcfb", outline: "none",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: C.textMid, marginBottom: 6, display: "block", fontFamily: FONT };

  if (sent) return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}><CheckCircle className="w-5 h-5 inline-block" /></div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: C.greenDark, marginBottom: 10, fontFamily: FONT }}>Ticket Submitted!</h3>
      <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, maxWidth: 360, margin: "0 auto 24px", fontFamily: FONT }}>
        Our IT team will respond to <strong>{form.email}</strong> within <strong>4 business hours</strong>. Your reference number is <strong>#CS-{Math.floor(Math.random() * 90000) + 10000}</strong>.
      </p>
      <button onClick={() => { setSent(false); setForm({ name: "", email: "", category: "", priority: "Medium", subject: "", message: "" }); }}
        style={{ background: `linear-gradient(135deg, ${C.greenDark}, ${C.greenMid})`, color: C.white, border: "none", borderRadius: 24, padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
        Submit Another Ticket
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Name + Email */}
      <div className="ticket-grid-2">
        <div>
          <label style={labelStyle}>Full Name <span style={{ color: C.red }}>*</span></label>
          <input style={inputStyle} placeholder="Your full name" value={form.name} onChange={e => update("name", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Email Address <span style={{ color: C.red }}>*</span></label>
          <input style={inputStyle} type="email" placeholder="your@email.com" value={form.email} onChange={e => update("email", e.target.value)} />
        </div>
      </div>

      {/* Category + Priority */}
      <div className="ticket-grid-2">
        <div>
          <label style={labelStyle}>Issue Category <span style={{ color: C.red }}>*</span></label>
          <select style={{ ...inputStyle, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32 }}
            value={form.category} onChange={e => update("category", e.target.value)}>
            <option value="">Select category</option>
            <option>Login / Password</option>
            <option>Results not showing</option>
            <option>Payment issue</option>
            <option>Assignment submission</option>
            <option>Messaging / Notifications</option>
            <option>Profile / Account settings</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Priority</label>
          <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
            {["Low", "Medium", "High"].map(p => (
              <label key={p} style={{
                display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer",
                padding: "8px 14px", borderRadius: 20, fontFamily: FONT,
                border: `1.5px solid ${form.priority === p ? (p === "High" ? C.red : p === "Medium" ? C.amber : C.greenAccent) : C.border}`,
                background: form.priority === p ? (p === "High" ? "#fef2f2" : p === "Medium" ? "#fffbeb" : C.greenLight) : C.white,
                color: form.priority === p ? (p === "High" ? C.red : p === "Medium" ? "#92400e" : C.greenDark) : C.textMid,
                transition: "all .2s",
              }}>
                <input type="radio" name="priority" value={p} checked={form.priority === p} onChange={() => update("priority", p)} style={{ display: "none" }} />
                {p}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Subject <span style={{ color: C.red }}>*</span></label>
        <input style={inputStyle} placeholder="Brief description of the issue" value={form.subject} onChange={e => update("subject", e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Message <span style={{ color: C.red }}>*</span></label>
        <textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical", lineHeight: 1.6 }}
          placeholder="Describe the issue in detail — include any error messages, steps taken, and your device/browser type…"
          value={form.message} onChange={e => update("message", e.target.value)} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => form.name && form.email && form.category && form.subject && form.message && setSent(true)}
          style={{
            background: `linear-gradient(135deg, ${C.greenDark}, ${C.greenMid})`,
            color: C.white, border: "none", borderRadius: 24, padding: "12px 32px",
            fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
            display: "flex", alignItems: "center", gap: 8,
            opacity: (form.name && form.email && form.category && form.subject && form.message) ? 1 : 0.55,
            transition: "opacity .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = (form.name && form.email && form.category && form.subject && form.message) ? "1" : "0.55"}
        >
          Submit Ticket
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Support() {
  const [activeGuide, setActiveGuide] = useState(GUIDES[0].id);
  const [openStep, setOpenStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("guides");
  const [guideOpen, setGuideOpen] = useState(false);

  const guide = GUIDES.find(g => g.id === activeGuide);

  const tabs = [
    { id: "guides", label: "Guides" },
    { id: "faq", label: "FAQs" },
    { id: "contact", label: "Contact" },
    { id: "ticket", label: "Ticket" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.greenPale, fontFamily: FONT, color: C.textDark }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
        * { box-sizing:border-box; font-family:'DM Sans',system-ui,sans-serif !important; }
        input:focus, select:focus, textarea:focus {
          border-color: ${C.greenAccent} !important;
          box-shadow: 0 0 0 3px rgba(45,110,62,0.1) !important;
          background: #fff !important;
        }
        button:focus { outline: none; }

        /* ── Responsive helpers ─────────────────────── */

        /* Hero */
        .s-hero { padding: 24px 20px 32px; }
        @media(min-width:640px)  { .s-hero { padding: 32px 40px 40px; } }
        @media(min-width:900px)  { .s-hero { padding: 40px 80px 48px; } }

        /* Tab bar */
        .s-tabbar { padding: 0 16px; overflow-x: auto; }
        @media(min-width:640px)  { .s-tabbar { padding: 0 40px; } }
        @media(min-width:900px)  { .s-tabbar { padding: 0 80px; } }

        /* Body */
        .s-body { padding: 20px 16px 60px; max-width: 1200px; margin: 0 auto; }
        @media(min-width:640px)  { .s-body { padding: 28px 32px 60px; } }
        @media(min-width:900px)  { .s-body { padding: 40px 48px 80px; } }

        /* Guides layout: single column → 2-col sidebar */
        .s-guides-layout { display: flex; flex-direction: column; gap: 16px; }
        @media(min-width:900px) {
          .s-guides-layout { display: grid; grid-template-columns: 280px 1fr; gap: 28px; }
        }

        /* Mobile topic toggle button */
        .s-guide-toggle { display: flex; }
        @media(min-width:900px) { .s-guide-toggle { display: none !important; } }

        /* Sidebar: hidden on mobile unless .open, always visible on desktop */
        .s-guide-sidebar { display: none; flex-direction: column; gap: 10px; }
        .s-guide-sidebar.open { display: flex; }
        @media(min-width:900px) { .s-guide-sidebar { display: flex !important; } }

        /* Contact cards grid */
        .s-contact-grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 24px; }
        @media(min-width:640px)  { .s-contact-grid { grid-template-columns: 1fr 1fr; } }
        @media(min-width:900px)  { .s-contact-grid { grid-template-columns: repeat(3, 1fr); } }

        /* Hours table: 2-col on mobile, 3-col on desktop */
        .s-hours-row { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 14px 0; font-size: 14px; }
        @media(min-width:640px)  { .s-hours-row { grid-template-columns: 1fr 1fr 1fr; } }
        .s-hours-resp { display: none; }
        @media(min-width:640px)  { .s-hours-resp { display: block; } }

        /* Priority cards */
        .s-priority-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 24px; }
        @media(min-width:540px)  { .s-priority-grid { grid-template-columns: 1fr 1fr; } }
        @media(min-width:900px)  { .s-priority-grid { grid-template-columns: repeat(3, 1fr); } }

        /* Ticket form 2-col fields */
        .ticket-grid-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media(min-width:600px)  { .ticket-grid-2 { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {/* ── HERO BANNER ── */}
      <div className="s-hero" style={{ background: `linear-gradient(135deg, ${C.greenDark} 0%, ${C.greenMid} 50%, #2d6e3e 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -60, top: -60, width: 380, height: 380, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", left: "55%", bottom: -90, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        <Link
          to="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none", marginBottom: 12, fontFamily: FONT }}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
        >
          ← Back to Home
        </Link>

        <div>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 700, color: C.white, lineHeight: 1.2, maxWidth: 540, marginBottom: 10, fontFamily: FONT }}>
            Support Centre
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, maxWidth: 480, lineHeight: 1.7, fontFamily: FONT }}>
            Browse step-by-step guides, read FAQs, or get in touch with our IT support team directly.
          </p>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div className="s-tabbar" style={{ background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", gap: 2 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: "none", border: "none",
            borderBottom: `3px solid ${activeTab === tab.id ? C.greenDark : "transparent"}`,
            padding: "14px 14px",
            fontSize: 13,
            fontWeight: activeTab === tab.id ? 700 : 500,
            color: activeTab === tab.id ? C.greenDark : C.textLight,
            cursor: "pointer", fontFamily: FONT, transition: "all .2s",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── BODY ── */}
      <div className="s-body">

        {/* ── GUIDES ── */}
        {activeTab === "guides" && (
          <div style={{ animation: "fadeUp .4s ease" }}>

            {/* Mobile topic picker */}
            <button
              className="s-guide-toggle"
              onClick={() => setGuideOpen(o => !o)}
              style={{
                width: "100%", marginBottom: 12,
                background: C.greenDark, color: C.white, border: "none",
                borderRadius: 12, padding: "13px 18px",
                alignItems: "center", justifyContent: "space-between",
                fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
              }}
            >
              <span>{guide.icon} {guide.title}</span>
              <span style={{ transform: guideOpen ? "rotate(180deg)" : "none", transition: "transform .25s", fontSize: 18 }}>⌄</span>
            </button>

            <div className="s-guides-layout">
              {/* Sidebar */}
              <div className={`s-guide-sidebar${guideOpen ? " open" : ""}`}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: C.textLight, marginBottom: 4, fontFamily: FONT }}>Topics</p>
                {GUIDES.map(g => (
                  <GuideCard key={g.id} guide={g} active={activeGuide === g.id}
                    onClick={() => { setActiveGuide(g.id); setOpenStep(0); setGuideOpen(false); }} />
                ))}
              </div>

              {/* Detail panel */}
              <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", animation: "fadeUp .35s ease" }} key={activeGuide}>
                <div style={{ padding: "20px 22px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, background: C.greenLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{guide.icon}</div>
                  <div>
                    <h2 style={{ fontSize: "clamp(16px, 3vw, 22px)", fontWeight: 700, color: C.textDark, fontFamily: FONT }}>{guide.title}</h2>
                    <p style={{ fontSize: 13, color: C.textLight, marginTop: 3, fontFamily: FONT }}>{guide.steps.length} steps · {guide.desc}</p>
                  </div>
                </div>
                <div style={{ padding: "20px 18px" }}>
                  {guide.steps.map((step, idx) => (
                    <StepAccordion key={idx} step={step} idx={idx} open={openStep === idx}
                      onToggle={() => setOpenStep(openStep === idx ? null : idx)} />
                  ))}
                </div>
                <div style={{ padding: "14px 22px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <span style={{ fontSize: 13, color: C.textLight, fontFamily: FONT }}>Was this guide helpful?</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Yes", "No"].map(l => (
                      <button key={l} style={{ background: C.greenLight, border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 16px", fontSize: 13, cursor: "pointer", fontFamily: FONT, color: C.greenDark, fontWeight: 500 }}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FAQ ── */}
        {activeTab === "faq" && (
          <div style={{ maxWidth: 820, animation: "fadeUp .4s ease" }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 700, color: C.textDark, marginBottom: 6, fontFamily: FONT }}>Frequently Asked Questions</h2>
              <p style={{ fontSize: 14, color: C.textLight, fontFamily: FONT }}>Can't find your answer here? Submit a support ticket and we'll get back to you.</p>
            </div>
            {FAQ_ITEMS.map((item, idx) => (
              <FaqItem key={idx} item={item} open={openFaq === idx} onToggle={() => setOpenFaq(openFaq === idx ? null : idx)} />
            ))}
            <div style={{ marginTop: 28, background: C.greenLight, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.greenDark, fontFamily: FONT }}>Still stuck?</p>
                <p style={{ fontSize: 13, color: C.textMid, marginTop: 2, fontFamily: FONT }}>Our IT team can help resolve your issue directly.</p>
              </div>
              <button onClick={() => setActiveTab("ticket")}
                style={{ background: `linear-gradient(135deg, ${C.greenDark}, ${C.greenMid})`, color: C.white, border: "none", borderRadius: 24, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap" }}>
                Submit a Ticket →
              </button>
            </div>
          </div>
        )}

        {/* ── CONTACT ── */}
        {activeTab === "contact" && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 700, color: C.textDark, marginBottom: 6, fontFamily: FONT }}>Contact IT Support</h2>
              <p style={{ fontSize: 14, color: C.textLight, fontFamily: FONT }}>Reach our team through any of the channels below. Support hours: Monday – Friday, 07:30 – 17:00.</p>
            </div>

            <div className="s-contact-grid">
              <ContactCard icon=<Phone className="w-5 h-5" /> title="Phone Support" subtitle="Speak directly with a technician" value="+263 4 123 4568" color={C.greenAccent} actionLabel="Call now" action="tel:+2634123456" />
              <ContactCard icon=<MessageSquare className="w-5 h-5" /> title="Email Support" subtitle="For non-urgent queries & documentation" value="itsupport@cornerstone.edu" color={C.gold} actionLabel="Send email" action="mailto:itsupport@cornerstone.edu" />
              <ContactCard icon=<MessageSquare className="w-5 h-5" /> title="Live Chat" subtitle="Fastest response during support hours" value="Available 07:30 – 17:00" color="#3b82f6" actionLabel="Start chat" action="#" />
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
              <div style={{ background: C.greenDark, padding: "14px 24px", color: C.white, fontSize: 13, fontWeight: 700, fontFamily: FONT }}> Support Hours &amp; Response Times</div>
              <div style={{ padding: "0 20px" }}>
                {[
                  ["Monday – Friday", "07:30 – 17:00", "Within 2 hours", C.greenAccent],
                  ["Saturday", "08:00 – 12:00", "Within 4 hours", C.amber],
                  ["Sunday & Public Holidays", "Closed", "Next business day", C.red],
                ].map(([day, hours, resp, col], i, arr) => (
                  <div key={i} className="s-hours-row" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ color: C.textDark, fontWeight: 500, fontFamily: FONT }}>{day}</span>
                    <span style={{ color: C.textMid, fontFamily: FONT }}>{hours}</span>
                    <span className="s-hours-resp" style={{ color: col, fontWeight: 600, fontFamily: FONT }}>{resp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: 38, flexShrink: 0 }}><MapPin className="w-5 h-5 inline-block" /></div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.textDark, marginBottom: 4, fontFamily: FONT }}>IT Support Desk — Physical Location</p>
                <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, fontFamily: FONT }}>Administration Block, Ground Floor, Room 04<br />Corner Stone Primary School, 14 Main Road, Harare, Zimbabwe</p>
                <p style={{ fontSize: 12, color: C.textLight, marginTop: 6, fontFamily: FONT }}>Walk-in support available Monday – Friday, 07:30 – 16:00. No appointment needed.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TICKET ── */}
        {activeTab === "ticket" && (
          <div style={{ maxWidth: 760, animation: "fadeUp .4s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 700, color: C.textDark, marginBottom: 6, fontFamily: FONT }}>Submit a Support Ticket</h2>
              <p style={{ fontSize: 14, color: C.textLight, fontFamily: FONT }}>Fill in the form below and our IT team will respond within the timeframe shown for your priority level.</p>
            </div>

            <div className="s-priority-grid">
              {[
                { label: "Low Priority", desc: "General how-to questions", time: "Response within 1 business day", bg: C.greenLight, color: C.greenDark },
                { label: "Medium Priority", desc: "Cannot access a feature", time: "Response within 4 hours", bg: "#fffbeb", color: "#92400e" },
                { label: "High Priority", desc: "Cannot log in / payment stuck", time: "Response within 2 hours", bg: "#fef2f2", color: C.red },
              ].map(p => (
                <div key={p.label} style={{ background: p.bg, border: `1px solid ${p.color}30`, borderRadius: 10, padding: "14px 16px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: p.color, marginBottom: 4, fontFamily: FONT }}>{p.label}</p>
                  <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.5, fontFamily: FONT }}>{p.desc}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: p.color, marginTop: 6, fontFamily: FONT }}>{p.time}</p>
                </div>
              ))}
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, background: C.greenLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}><HelpCircle className="w-5 h-5" /></div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textDark, fontFamily: FONT }}>New Support Request</h3>
                  <p style={{ fontSize: 12, color: C.textLight, marginTop: 2, fontFamily: FONT }}>All fields marked <span style={{ color: C.red }}>*</span> are required</p>
                </div>
              </div>
              <div style={{ padding: "20px 20px" }}>
                <TicketForm />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}