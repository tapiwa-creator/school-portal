import { useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  GraduationCap,
  Calendar,
  Lock,
  CheckCircle,
  Clock,
  Home,
  BookOpen,
  Dumbbell,
} from "lucide-react";

// ── Data ───────────────────────────────────────────────────────────────────
const FEE_BREAKDOWN = [
  { label: "Tuition Fees", amount: 3800, paid: 3800, icon: <GraduationCap className="w-5 h-5" /> },
  { label: "Residence & Meals", amount: 800, paid: 600, icon: <Home className="w-5 h-5" /> },
  { label: "Registration Fee", amount: 200, paid: 200, icon: <ClipboardList className="w-5 h-5" /> },
  { label: "Library Levy", amount: 100, paid: 100, icon: <BookOpen className="w-5 h-5" /> },
  { label: "Sports Levy", amount: 100, paid: 60, icon: <Dumbbell className="w-5 h-5" /> },
];

const TRANSACTIONS = [
  { id: "TXN-001", date: "2026-02-28", description: "Tuition Fee Payment", amount: 1500, method: "Bank Transfer", status: "success", ref: "BT20260228A" },
  { id: "TXN-002", date: "2026-02-10", description: "Tuition Fee Payment", amount: 1200, method: "Bank Transfer", status: "success", ref: "BT20260210B" },
  { id: "TXN-003", date: "2026-01-25", description: "Registration & Library", amount: 300, method: "Cash", status: "success", ref: "CS20260125C" },
  { id: "TXN-004", date: "2026-01-15", description: "Tuition Fee – Instalment", amount: 800, method: "Bank Transfer", status: "success", ref: "BT20260115D" },
  { id: "TXN-005", date: "2026-01-05", description: "Sports & Residence Part", amount: 160, method: "EcoCash", status: "success", ref: "EC20260105E" },
  { id: "TXN-006", date: "2025-12-01", description: "Residence Deposit", amount: 400, method: "Bank Transfer", status: "success", ref: "BT20251201F" },
  { id: "TXN-007", date: "2026-03-01", description: "Pending Instalment", amount: 400, method: "Bank Transfer", status: "pending", ref: "BT20260301G" },
];

const METHOD_STYLES = {
  "Bank Transfer": { bg: "bg-blue-50", text: "text-blue-700" },
  "Cash": { bg: "bg-green-50", text: "text-green-700" },
  "EcoCash": { bg: "bg-orange-50", text: "text-orange-700" },
};

const PAYMENT_METHODS = [
  { id: "bank", label: "Bank Transfer", icon: "🏦", desc: "FNB · Acc: 6200 1234 5678" },
  { id: "ecocash", label: "EcoCash", icon: "📱", desc: "0771 234 567" },
  { id: "cash", label: "Cash at Office", icon: "💵", desc: "Admin Block, Room 101" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

const totalBilled = FEE_BREAKDOWN.reduce((s, f) => s + f.amount, 0);
const totalPaid = FEE_BREAKDOWN.reduce((s, f) => s + f.paid, 0);
const totalBalance = totalBilled - totalPaid;
const paidPct = Math.round((totalPaid / totalBilled) * 100);

// ── Component ──────────────────────────────────────────────────────────────
export default function FeesPayment() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selMethod, setSelMethod] = useState("bank");
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handlePay = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
    setAmount("");
  };

  const balanceValueColor = totalBalance > 0 ? "#fca5a5" : "#86efac";

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 pt-16 md:pt-6">

      {/* ══════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #0a1f0d 0%, #1a4d2e 55%, #2d6a4f 100%)" }}
      >
        {/* Decorative glows */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #4ade80, transparent)", transform: "translate(35%,-35%)" }} />
        <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #c8a84b, transparent)", transform: "translateY(45%)" }} />

        <div className="relative px-5 md:px-8 py-5 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-green-400 mb-1">
              Academic Year 2025 / 2026
            </p>
            <h1 className="text-2xl font-bold text-white leading-tight">Fee Payments</h1>
            <p className="text-sm text-green-300 mt-1.5">
              BCom Accounting – Year 2 &nbsp;·&nbsp; Next due: <span className="text-white font-semibold">15 Mar 2026</span>
            </p>
          </div>

          {/* Right — stat chips */}
          <div className="flex gap-2 md:gap-3 flex-shrink-0">
            <div className="text-center rounded-xl px-3 md:px-5 py-2 md:py-3 border border-white/10 flex-1 md:flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.12)" }}>
              <div className="text-base md:text-xl font-bold text-white">{fmt(totalBilled)}</div>
              <div className="text-[10px] md:text-xs text-green-300 mt-0.5">Total Billed</div>
            </div>
            <div className="text-center rounded-xl px-3 md:px-5 py-2 md:py-3 border border-white/10 flex-1 md:flex-shrink-0"
              style={{ background: "rgba(76,175,96,0.2)" }}>
              <div className="text-base md:text-xl font-bold text-white">{fmt(totalPaid)}</div>
              <div className="text-[10px] md:text-xs text-green-300 mt-0.5">Total Paid</div>
            </div>
            <div className="text-center rounded-xl px-3 md:px-5 py-2 md:py-3 border border-white/10 flex-1 md:flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.12)" }}>
              <div className="text-base md:text-xl font-bold" style={{ color: balanceValueColor }}>
                {fmt(totalBalance)}
              </div>
              <div className="text-[10px] md:text-xs text-green-300 mt-0.5">Balance Due</div>
            </div>
          </div>
        </div>

        {/* Progress bar inside banner */}
        <div className="relative px-5 md:px-8 pb-5 md:pb-6">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-green-300 font-semibold">{paidPct}% paid</span>
            <span className="text-green-400">{fmt(totalPaid)} of {fmt(totalBilled)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${paidPct}%`, background: "linear-gradient(90deg, #4ade80, #22c55e)" }} />
          </div>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 border-t-4 border-t-green-700">
          <div className="text-gray-400 text-base mb-3">💰</div>
          <div className="text-xl md:text-2xl font-bold text-gray-900 leading-none">{fmt(totalBilled)}</div>
          <div className="text-xs font-semibold text-green-700 mt-2">Total Billed</div>
          <div className="text-xs text-gray-400 mt-0.5">This academic year</div>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 border-t-4 border-t-green-700">
          <div className="text-gray-400 text-base mb-3"><CheckCircle className="w-5 h-5 inline-block" /></div>
          <div className="text-xl md:text-2xl font-bold text-gray-900 leading-none">{fmt(totalPaid)}</div>
          <div className="text-xs font-semibold text-green-700 mt-2">Amount Paid</div>
          <div className="text-xs text-gray-400 mt-0.5">{paidPct}% cleared</div>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 border-t-4 border-t-green-700">
          <div className="text-gray-400 text-base mb-3"><AlertTriangle className="w-5 h-5 inline-block" /></div>
          <div className={`text-xl md:text-2xl font-bold leading-none ${totalBalance > 0 ? "text-red-500" : "text-green-600"}`}>
            {fmt(totalBalance)}
          </div>
          <div className="text-xs font-semibold text-green-700 mt-2">Balance Due</div>
          <div className="text-xs text-gray-400 mt-0.5">Remaining balance</div>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 border-t-4 border-t-green-700">
          <div className="text-gray-400 text-base mb-3"><Calendar className="w-5 h-5 inline-block" /></div>
          <div className="text-xl md:text-2xl font-bold text-gray-900 leading-none">15 Mar</div>
          <div className="text-xs font-semibold text-green-700 mt-2">Next Due Date</div>
          <div className="text-xs text-gray-400 mt-0.5">2026</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full md:w-fit">
        {["overview", "pay", "history"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 md:flex-none px-4 md:px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === t ? "bg-[#1a4d2e] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
            {t === "pay" ? "Make Payment" : t === "history" ? "History" : "Overview"}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

          {/* Fee breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-gray-50 flex items-center gap-3">
              <span className="text-base font-bold text-gray-900">Fee Breakdown</span>
              <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full">
                {FEE_BREAKDOWN.length} items
              </span>
            </div>
            <div className="p-4 md:p-5 space-y-4">
              {FEE_BREAKDOWN.map((f) => {
                const pct = Math.round((f.paid / f.amount) * 100);
                const bal = f.amount - f.paid;
                return (
                  <div key={f.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{f.icon}</span>
                        <span className="text-sm font-semibold text-gray-800">{f.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{fmt(f.paid)}</span>
                        <span className="text-xs text-gray-400"> / {fmt(f.amount)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100
                            ? "linear-gradient(90deg,#16a34a,#4ade80)"
                            : "linear-gradient(90deg,#ca8a04,#facc15)",
                        }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{pct}% paid</span>
                      {bal > 0
                        ? <span className="text-xs font-semibold text-red-500">{fmt(bal)} remaining</span>
                        : <span className="text-xs font-semibold text-green-600">Cleared ✓</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total row */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700">Total Balance Due</span>
                <span className={`text-lg font-bold ${totalBalance > 0 ? "text-red-500" : "text-green-600"}`}>
                  {fmt(totalBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">Due by 15 Mar 2026</span>
                <span className="text-xs text-green-600 font-semibold">{paidPct}% complete</span>
              </div>
            </div>
          </div>

          {/* Payment summary + quick pay */}
          <div className="flex flex-col gap-4 md:gap-5">

            {/* Summary donut-style ring */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <p className="text-base font-bold text-gray-900 mb-4">Payment Progress</p>
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0fdf4" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke="#16a34a" strokeWidth="3.5"
                      strokeDasharray={`${paidPct} 100`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">{paidPct}%</span>
                    <span className="text-[10px] text-gray-400">Paid</span>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  {[
                    { label: "Paid", value: fmt(totalPaid), color: "bg-green-500" },
                    { label: "Balance", value: fmt(totalBalance), color: totalBalance > 0 ? "bg-red-400" : "bg-green-400" },
                    { label: "Billed", value: fmt(totalBilled), color: "bg-gray-200" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span className="text-xs text-gray-500">{label}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick pay CTA */}
            <div className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg,#1a4d2e,#2d6a4f)" }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle,#4ade80,transparent)", transform: "translate(30%,-30%)" }} />
              <p className="text-xs font-semibold tracking-widest uppercase text-green-300 mb-1">Next Payment</p>
              <p className={`text-2xl font-bold ${totalBalance > 0 ? "text-red-300" : "text-green-300"}`}>
                {fmt(totalBalance)}
              </p>
              <p className="text-xs text-green-300 mt-0.5 mb-4">Due by 15 March 2026</p>
              <button onClick={() => setActiveTab("pay")}
                className="w-full py-2.5 rounded-xl bg-white text-[#1a4d2e] text-sm font-bold hover:bg-green-50 transition-colors">
                Pay Now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: MAKE PAYMENT
      ══════════════════════════════════════════ */}
      {activeTab === "pay" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-gray-50">
              <span className="text-base font-bold text-gray-900">Make a Payment</span>
            </div>
            <div className="p-5 md:p-6 space-y-5">

              {submitted && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-700">Payment Submitted!</p>
                    <p className="text-xs text-green-600 mt-0.5">Your payment is being processed. Allow 1–2 business days.</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 font-semibold text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
                </div>
                <div className="flex gap-2 mt-2">
                  {[100, 200, 500, totalBalance].map(v => (
                    <button key={v} onClick={() => setAmount(String(v))}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">
                      {v === totalBalance ? "Full" : `$${v}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.id} onClick={() => setSelMethod(m.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${selMethod === m.id ? "border-green-600 bg-green-50" : "border-gray-100 hover:border-gray-200"
                        }`}>
                      <span className="text-xl flex-shrink-0">{m.icon}</span>
                      <div>
                        <p className={`text-sm font-semibold ${selMethod === m.id ? "text-green-800" : "text-gray-800"}`}>
                          {m.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                      </div>
                      {selMethod === m.id && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                            <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Reference / Note (optional)
                </label>
                <input type="text" placeholder="e.g. March instalment"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all" />
              </div>

              <button onClick={handlePay}
                className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#1a4d2e,#2d6a4f)", boxShadow: "0 4px 16px rgba(26,77,46,0.3)" }}>
                {amount ? `Pay ${isNaN(amount) ? "" : `$${Number(amount).toFixed(2)}`}` : "Enter Amount to Continue"}
              </button>

              <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Payments are processed securely. Allow 1–2 business days for confirmation.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-900 mb-4">Payment Summary</p>
              <div className="space-y-2.5">
                {[
                  { label: "Total Billed", value: fmt(totalBilled), color: "text-gray-800" },
                  { label: "Amount Paid", value: fmt(totalPaid), color: "text-green-600" },
                  { label: "Current Balance", value: fmt(totalBalance), color: totalBalance > 0 ? "text-red-500" : "text-green-600" },
                  { label: "You are paying", value: amount ? `$${Number(amount).toFixed(2)}` : "–", color: "text-blue-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                  </div>
                ))}
                {amount && !isNaN(amount) && Number(amount) > 0 && (
                  <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-gray-100">
                    <span className="text-xs font-bold text-gray-700">After Payment</span>
                    <span className={`text-sm font-bold ${Math.max(0, totalBalance - Number(amount)) > 0 ? "text-red-500" : "text-green-700"}`}>
                      {fmt(Math.max(0, totalBalance - Number(amount)))}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {selMethod === "bank" && (
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Bank Details</p>
                {[
                  { label: "Bank", value: "First National Bank" },
                  { label: "Account Name", value: "Corner Stone College" },
                  { label: "Account No.", value: "6200 1234 5678" },
                  { label: "Branch Code", value: "250655" },
                  { label: "Reference", value: "STU-20250042" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-blue-100 last:border-0">
                    <span className="text-xs text-blue-500">{label}</span>
                    <span className="text-xs font-bold text-blue-800">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {selMethod === "ecocash" && (
              <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3">EcoCash Details</p>
                {[
                  { label: "Merchant Number", value: "0771 234 567" },
                  { label: "Merchant Name", value: "Corner Stone Coll." },
                  { label: "Reference", value: "STU-20250042" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-orange-100 last:border-0">
                    <span className="text-xs text-orange-500">{label}</span>
                    <span className="text-xs font-bold text-orange-800">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: HISTORY
      ══════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-gray-900">Transaction History</span>
              <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full">
                {TRANSACTIONS.length} records
              </span>
            </div>
            <button className="text-xs font-semibold text-green-700 hover:text-green-900 transition-colors whitespace-nowrap">
              Download ↓
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50">
                <tr>
                  {["Ref / ID", "Date", "Description", "Method", "Amount", "Status"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 md:px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TRANSACTIONS.map((t) => {
                  const M = METHOD_STYLES[t.method] || METHOD_STYLES["Bank Transfer"];
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <p className="text-xs font-mono font-bold text-gray-700">{t.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t.ref}</p>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                        {new Date(t.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className="text-sm font-medium text-gray-800">{t.description}</span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${M.bg} ${M.text}`}>
                          {t.method}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{fmt(t.amount)}</span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {t.status === "success" ? (
                          <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                            ✓ Success
                          </span>
                        ) : (
                          <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-xs text-gray-400">Showing all {TRANSACTIONS.length} transactions</span>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-500">Total paid: <span className="font-bold text-green-700">{fmt(totalPaid)}</span></span>
              <span className="text-gray-500">Balance: <span className={`font-bold ${totalBalance > 0 ? "text-red-500" : "text-green-600"}`}>{fmt(totalBalance)}</span></span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}