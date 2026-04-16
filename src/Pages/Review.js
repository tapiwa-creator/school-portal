import { CheckItem } from "../Components/FormComponents";
import { C } from "../Components/FormComponents";
import { ClipboardList, Edit2 } from "lucide-react";

export default function StepReview({ formData, onEdit }) {
  const { eligibility: e, student: s, parent: p } = formData;

  const Section = ({ title, rows, stepIndex }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${C.border}`, marginBottom: 16, paddingBottom: 10,
      }}>
        <div style={{
          fontWeight: 700, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase",
          color: C.greenMid, fontFamily: "'DM Sans', system-ui, sans-serif"
        }}>
          {title}
        </div>
        {typeof stepIndex === "number" && onEdit && (
          <button 
            type="button"
            onClick={() => onEdit(stepIndex)}
            style={{
              background: "none", border: "none", color: C.greenAccent, 
              fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              fontFamily: "'DM Sans', system-ui, sans-serif", padding: 0
            }}>
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
        {rows.map(([label, value]) => value ? (
          <div key={label}>
            <div style={{
              fontSize: 11, color: C.textLight,
              fontFamily: "'DM Sans', system-ui, sans-serif", marginBottom: 2
            }}>{label}</div>
            <div style={{
              fontSize: 14, color: C.textDark, fontWeight: 600,
              fontFamily: "'DM Sans', system-ui, sans-serif"
            }}>{value}</div>
          </div>
        ) : null)}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{
        background: C.greenLight, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, marginBottom: 28
      }}>
        <span style={{ fontSize: 28, color: C.greenMid, flexShrink: 0 }}><ClipboardList className="w-6 h-6 inline-block" /></span>
        <div>
          <p style={{
            fontSize: 14, fontWeight: 700, color: C.greenMid,
            fontFamily: "'DM Sans', system-ui, sans-serif", marginBottom: 2
          }}>
            Review your application carefully
          </p>
          <p style={{
            fontSize: 13, color: C.textMid, lineHeight: 1.5,
            fontFamily: "'DM Sans', system-ui, sans-serif"
          }}>
            Please confirm that all details below are correct before submitting. 
            Once submitted, modifications will require contacting the admissions office.
          </p>
        </div>
      </div>

      <Section
        title="Eligibility Details"
        stepIndex={0}
        rows={[
          ["Age", e?.age ? `${e.age} years` : "—"],
          ["Country", e?.country || "—"],
          ["Has Birth Certificate", e?.hasCert || "—"]
        ]}
      />

      <Section
        title="Student Details"
        stepIndex={1}
        rows={[
          ["Full Name", [s?.firstName, s?.middleName, s?.lastName].filter(Boolean).join(" ") || "—"],
          ["Date of Birth", s?.dob || "—"],
          ["Gender", s?.gender || "—"],
          ["Nationality", s?.nationality || "—"],
          ["Cert No.", s?.certNo || "—"],
          ["Home Language", s?.language || "—"],
          ["Applying for Grade", s?.grade || "—"],
          ["Academic Year", s?.year || "2025 / 2026"],
          ["Term", s?.term || "—"],
          ["Previous School", s?.prevSchool || "N/A"],
        ]}
      />

      <Section
        title="Parent / Guardian Info"
        stepIndex={2}
        rows={[
          ["Primary Contact", [p?.pFirstName, p?.pLastName].filter(Boolean).join(" ") || "—"],
          ["Relationship", p?.relationship || "—"],
          ["Phone Number", p?.phone || "—"],
          ["Email Address", p?.email || "—"],
          ["National ID", p?.pNatId || "—"],
          ["Physical Address", p?.address || "—"],
        ]}
      />

      <div style={{ marginBottom: 24, marginTop: 40 }}>
        <div style={{
          fontWeight: 700, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase",
          color: C.greenMid, marginBottom: 12, paddingBottom: 8,
          borderBottom: `1px solid ${C.border}`,
          fontFamily: "'DM Sans', system-ui, sans-serif"
        }}>
          Declaration & Consent
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, background: C.white, padding: "16px", borderRadius: 12, border: `1px solid ${C.border}` }}>
          <CheckItem>I confirm all information provided is accurate and complete to the best of my knowledge.</CheckItem>
          <CheckItem>I understand that false information may result in rejection or cancellation of enrolment.</CheckItem>
          <CheckItem>I consent to Corner Stone Primary School contacting me regarding this application.</CheckItem>
        </div>
      </div>
    </div>
  );
}