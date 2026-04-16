import { useState, useRef } from "react";

// ─── Font: DM Sans — same as all portal modules ───────────────────────────────
export const FONT = "'DM Sans', system-ui, sans-serif";

// ─── Colour tokens ────────────────────────────────────────────────────────────
export const C = {
  greenDark:   "#0d2818",
  greenMid:    "#1a4d2a",
  greenAccent: "#2d6e3e",
  greenLight:  "#e8f5ee",
  gold:        "#c8a84b",
  border:      "#d4e6da",
  textDark:    "#111",
  textMid:     "#444",
  textLight:   "#888",
};

// ─── Field styles ─────────────────────────────────────────────────────────────
export const field = {
  label: { fontSize: 12, fontWeight: 600, color: C.textMid, letterSpacing: 0.3, marginBottom: 6, display: "block", fontFamily: FONT },
  input: {
    border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px",
    fontSize: 14, color: C.textDark, background: "#fafcfb", width: "100%",
    outline: "none", fontFamily: FONT, transition: "border-color .2s, box-shadow .2s",
  },
  select: {
    border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px",
    fontSize: 14, color: C.textDark, background: "#fafcfb", width: "100%",
    outline: "none", fontFamily: FONT, appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36,
  },
  textarea: {
    border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px",
    fontSize: 14, color: C.textDark, background: "#fafcfb", width: "100%",
    outline: "none", fontFamily: FONT, minHeight: 88, resize: "vertical", lineHeight: 1.55,
  },
  hint: { fontSize: 11, color: C.textLight, marginTop: 3, fontFamily: FONT },
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
export const Label = ({ children, required }) => (
  <label style={field.label}>
    {children}{required && <span style={{ color: "#e74c3c", marginLeft: 2 }}>*</span>}
  </label>
);

export const Input = (props) => (
  <input style={field.input} {...props} />
);

export const Select = ({ children, ...props }) => (
  <select style={field.select} {...props}>
    {children}
  </select>
);

export const Textarea = (props) => (
  <textarea style={field.textarea} {...props} />
);

export const SectionTitle = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, marginTop: 32 }}>
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.3, textTransform: "uppercase", color: C.greenMid, whiteSpace: "nowrap", fontFamily: FONT }}>
      {children}
    </span>
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);

export const Row = ({ children, cols = 2 }) => (
  <div style={{ 
    display: "grid", 
    gridTemplateColumns: `repeat(${cols}, 1fr)`, 
    gap: 18, 
    marginBottom: 18
  }}>
    {children}
  </div>
);

export const Field = ({ label, required, hint, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    {label && <Label required={required}>{label}</Label>}
    {children}
    {hint && <span style={field.hint}>{hint}</span>}
  </div>
);

export const UploadBox = ({ icon, label, accept, hint }) => {
  const ref = useRef();
  const [fileName, setFileName] = useState(null);
  return (
    <div
      onClick={() => ref.current.click()}
      style={{
        border: `2px dashed ${fileName ? C.greenAccent : C.border}`, borderRadius: 12,
        padding: 22, textAlign: "center", background: fileName ? "#ddf0e6" : C.greenLight,
        cursor: "pointer", transition: "all .2s",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 13, color: C.textMid, fontWeight: 500, fontFamily: FONT }}>{fileName || label}</p>
      <span style={{ fontSize: 11, color: C.textLight, fontFamily: FONT }}>{hint}</span>
      <input 
        ref={ref} 
        type="file" 
        accept={accept} 
        style={{ display: "none" }}
        onChange={e => e.target.files[0] && setFileName(e.target.files[0].name)} 
      />
    </div>
  );
};

export const RadioGroup = ({ options, value, onChange, name = "radio" }) => (
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
    {options.map(opt => (
      <label key={opt} style={{
        display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer",
        background: value === opt ? C.greenMid : C.greenLight,
        color: value === opt ? "#fff" : C.textMid,
        padding: "8px 18px", borderRadius: 20,
        border: `1.5px solid ${value === opt ? C.greenMid : C.border}`,
        transition: "all .2s", fontFamily: FONT, fontWeight: value === opt ? 600 : 400,
      }}>
        <input 
          type="radio" 
          name={name} 
          value={opt} 
          checked={value === opt}
          onChange={() => onChange(opt)} 
          style={{ display: "none" }} 
        />
        {opt}
      </label>
    ))}
  </div>
);

export const CheckItem = ({ children, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.textMid, cursor: "pointer", fontFamily: FONT }}>
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange}
      style={{ width: 16, height: 16, accentColor: C.greenMid }} 
    />
    {children}
  </label>
);

// ─── Helper function for focus styles (to be used with global CSS) ───────────
export const focusStyles = `
  input:focus, select:focus, textarea:focus {
    border-color: ${C.greenAccent} !important;
    box-shadow: 0 0 0 3px rgba(45,110,62,0.1) !important;
    background: #fff !important;
  }
`;

// ─── Default export for all components ────────────────────────────────────────
export default {
  Label,
  Input,
  Select,
  Textarea,
  SectionTitle,
  Row,
  Field,
  UploadBox,
  RadioGroup,
  CheckItem,
  C,
  FONT,
  field,
  focusStyles
};