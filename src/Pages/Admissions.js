import { useState } from "react";
import { Link } from "react-router-dom";
import StepEligibility from "./Eligibility";
import StepStudentInfo from "./StudentInfo";
import StepParent from "./Parents";
import StepDocuments from "./Documents";
import StepReview from "./Review";
import emailjs from "@emailjs/browser";
import {
  Calendar, CheckCircle, MessageSquare, Mail, Phone, School
} from "lucide-react";

// ── Font: DM Sans ──────────────────────────────────────
const FONT = "'DM Sans', system-ui, sans-serif";

// ── Brand tokens (Same as Support.js) ───────────────────
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

const STEPS = [
  { label: "Eligibility Check", desc: "Basic requirements" },
  { label: "Student Information", desc: "Personal and academic" },
  { label: "Parent / Guardian", desc: "Contact details" },
  { label: "Documents", desc: "Upload requirements" },
  { label: "Review & Submit", desc: "Confirm application" },
];

function Sidebar({ currentStep, setStep }) {
  const SideCard = ({ header, children }) => (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 16 }}>
      {header && (
        <div style={{ background: C.greenDark, padding: "14px 20px", color: C.white, fontSize: 13, fontWeight: 700, fontFamily: FONT }}>
          {header}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: C.textLight, marginBottom: 8, fontFamily: FONT }}>
        Application Checklist
      </p>
      <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
        {STEPS.map((s, idx) => {
          const active = currentStep === idx;
          const completed = currentStep > idx;
          return (
            <button
              key={idx}
              onClick={() => {
                if (idx < currentStep) setStep(idx);
              }}
              style={{
                width: "100%", textAlign: "left",
                background: active ? C.greenDark : C.white,
                border: `1.5px solid ${active ? C.greenDark : C.border}`,
                borderRadius: 12, padding: "14px 18px", 
                cursor: idx < currentStep ? "pointer" : "default",
                display: "flex", alignItems: "center", gap: 14,
                transition: "all .2s", fontFamily: FONT,
                boxShadow: active ? "0 4px 16px rgba(13,40,24,0.2)" : "none",
              }}
            >
              <div style={{ 
                width: 28, height: 28, borderRadius: "50%", 
                background: completed ? C.greenAccent : (active ? 'rgba(255,255,255,0.2)' : C.greenLight), 
                color: completed || active ? C.white : C.textMid, 
                fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
              }}>
                {completed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: active ? C.white : C.textDark, fontFamily: FONT }}>{s.label}</div>
                <div style={{ fontSize: 11, color: active ? "rgba(255,255,255,0.65)" : C.textLight, marginTop: 2, fontFamily: FONT }}>{s.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <SideCard header={<><Calendar className="w-4 h-4 inline-block mr-2 align-text-bottom" /> Key Dates</>}>
        <div style={{ fontSize: 12, color: C.textMid, fontFamily: FONT, lineHeight: 1.7 }}>
          <strong>Academic Year:</strong> 2025 / 2026<br />
          <strong>Application Period:</strong> Jan 15 – Apr 30<br />
          <strong>Results Announced:</strong> May 20, 2025
        </div>
      </SideCard>
      
      <SideCard header={<><MessageSquare className="w-4 h-4 inline-block mr-2 align-text-bottom" /> Need Help?</>}>
        <div style={{ fontSize: 12, color: C.textMid, fontFamily: FONT, lineHeight: 1.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Phone className="w-4 h-4" /> +263 4 123 4567</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail className="w-4 h-4" /> admissions@cornerstone.edu</div>
        </div>
      </SideCard>
    </div>
  );
}

export default function Admissions() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eligibility: {},
    student: {},
    parent: {},
    documents: {},
  });

  const updateStep = (stepKey, f, v) =>
    setFormData(prev => ({
      ...prev,
      [stepKey]: { ...prev[stepKey], [f]: v },
    }));

  const isLastStep = currentStep === STEPS.length - 1;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const { student: s, parent: p, eligibility: e } = formData;
    const message = `
NEW ADMISSION APPLICATION

--- STUDENT INFO ---
Name: ${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}
DOB: ${s.dob || 'N/A'} | Gender: ${s.gender || 'N/A'}
Grade applying for: ${s.grade || 'N/A'} 
Academic Year: ${s.year || 'N/A'}

--- PARENT/GUARDIAN INFO ---
Name: ${p.pFirstName || ''} ${p.pLastName || ''}
Relationship: ${p.relationship || 'N/A'}
Phone: ${p.phone || 'N/A'}
Email: ${p.email || 'N/A'}

--- ELIGIBILITY ---
Age: ${e.age || 'N/A'}
Country: ${e.country || 'N/A'}
Birth Cert: ${e.hasCert || 'N/A'}
    `;

    const templateParams = {
      message: message,
      reply_to: p.email || "",
      student_name: `${s.firstName || ''} ${s.lastName || ''}`,
      parent_name: `${p.pFirstName || ''} ${p.pLastName || ''}`,
      parent_email: p.email || "",
      parent_phone: p.phone || ""
    };

    try {
      await emailjs.send(
        "service_s1dqnqe", 
        "template_zwqjv3s", 
        templateParams,
        "YOUR_PUBLIC_KEY" // REPLACE THIS with EmailJS Public Key
      );
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to send application email:", error);
      alert("Failed to submit application. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: C.greenPale, fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 48, textAlign: "center", maxWidth: 480, margin: "0 20px", boxShadow: "0 12px 32px rgba(0,0,0,0.05)" }}>
          <div style={{ width: 80, height: 80, background: C.greenLight, color: C.greenDark, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.greenDark, marginBottom: 12 }}>Application Received!</h2>
          <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6, marginBottom: 32 }}>
            Thank you for applying to Corner Stone Primary School. We have received your application successfully and sent a confirmation email to <strong>{formData.parent.email || "your provided email"}</strong>.
          </p>
          <Link to="/" style={{ 
            background: `linear-gradient(135deg, ${C.greenDark}, ${C.greenMid})`, 
            color: C.white, textDecoration: "none", padding: "12px 28px", borderRadius: 24, 
            fontSize: 14, fontWeight: 600, display: "inline-flex" 
          }}>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.greenPale, fontFamily: FONT, color: C.textDark }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        * { box-sizing:border-box; font-family:'DM Sans',system-ui,sans-serif !important; }
        .s-hero { padding: 24px 20px 32px; }
        @media(min-width:640px)  { .s-hero { padding: 32px 40px 40px; } }
        @media(min-width:900px)  { .s-hero { padding: 40px 80px 48px; } }
        .s-body { padding: 20px 16px 60px; max-width: 1200px; margin: 0 auto; }
        @media(min-width:640px)  { .s-body { padding: 28px 32px 60px; } }
        @media(min-width:900px)  { .s-body { padding: 40px 48px 80px; } }
        .s-guides-layout { display: flex; flex-direction: column; gap: 24px; }
        @media(min-width:900px) {
          .s-guides-layout { display: grid; grid-template-columns: 280px 1fr; gap: 32px; align-items: start; }
        }
      `}</style>

      {/* ── HERO BANNER ── */}
      <div className="s-hero" style={{ background: `linear-gradient(135deg, ${C.greenDark} 0%, ${C.greenMid} 50%, #2d6e3e 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -60, top: -60, width: 380, height: 380, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", left: "55%", bottom: -90, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        <Link
          to="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none", marginBottom: 12, fontFamily: FONT }}
        >
          ← Back to Home
        </Link>
        <div>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 700, color: C.white, lineHeight: 1.2, maxWidth: 540, marginBottom: 10, fontFamily: FONT }}>
            Admissions Application
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, maxWidth: 480, lineHeight: 1.7, fontFamily: FONT }}>
            Welcome to Corner Stone Primary. Please complete all steps and review carefully before submitting.
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="s-body">
        <div className="s-guides-layout">
          {/* Sidebar */}
          <div>
            <Sidebar currentStep={currentStep} setStep={setCurrentStep} />
          </div>

          {/* Form Content */}
          <div style={{ animation: "fadeUp .4s ease" }}>
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, background: C.greenLight, color: C.greenDark, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                  {currentStep + 1}
                </div>
                <div>
                  <h2 style={{ fontSize: "clamp(16px, 3vw, 20px)", fontWeight: 700, color: C.textDark, fontFamily: FONT }}>
                    {STEPS[currentStep].label}
                  </h2>
                  <p style={{ fontSize: 13, color: C.textLight, marginTop: 3, fontFamily: FONT }}>
                    Step {currentStep + 1} of {STEPS.length}
                  </p>
                </div>
              </div>
              
              <div style={{ padding: "32px 24px" }}>
                {currentStep === 0 && <StepEligibility data={formData.eligibility} update={(f, v) => updateStep("eligibility", f, v)} />}
                {currentStep === 1 && <StepStudentInfo data={formData.student} update={(f, v) => updateStep("student", f, v)} />}
                {currentStep === 2 && <StepParent data={formData.parent} update={(f, v) => updateStep("parent", f, v)} />}
                {currentStep === 3 && <StepDocuments data={formData.documents || {}} update={(f, v) => updateStep("documents", f, v)} />}
                {/* Notice the onEdit prop passed so StepReview knows how to jump steps! */}
                {currentStep === 4 && <StepReview formData={formData} onEdit={(stepIdx) => setCurrentStep(stepIdx)} />}
              </div>

              <div style={{ padding: "16px 24px", background: C.greenPale, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {currentStep > 0 ? (
                  <button 
                    onClick={() => setCurrentStep(s => s - 1)} 
                    disabled={isSubmitting}
                    style={{ background: C.white, border: `1px solid ${C.border}`, padding: "10px 24px", borderRadius: 24, fontSize: 13, fontWeight: 600, color: C.textMid, cursor: "pointer", fontFamily: FONT }}
                  >
                    Back
                  </button>
                ) : <div />}

                <button 
                  disabled={isSubmitting} 
                  onClick={isLastStep ? handleSubmit : () => setCurrentStep(s => s + 1)}
                  style={{ 
                    background: `linear-gradient(135deg, ${C.greenDark}, ${C.greenMid})`, 
                    color: C.white, border: "none", padding: "12px 28px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: isSubmitting ? "wait" : "pointer", fontFamily: FONT,
                    opacity: isSubmitting ? 0.7 : 1, transition: "opacity 0.2s"
                  }}
                >
                  {isSubmitting ? "Submitting..." : (isLastStep ? "Submit Application" : "Continue")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}