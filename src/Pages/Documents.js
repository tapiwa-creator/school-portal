import { Field, Row, SectionTitle, UploadBox } from "../Components/FormComponents";
import { AlertTriangle, ClipboardList, Home } from "lucide-react";

export default function StepDocuments() {
  return (
    <div>
      <SectionTitle>Required Documents</SectionTitle>
      <div style={{
        background: "#fff3cd", border: "1px solid #f0c04d", borderRadius: 12,
        padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 24
      }}>
        <span style={{ fontSize: 22 }}><AlertTriangle className="w-5 h-5 inline-block" /></span>
        <div>
          <p style={{
            fontSize: 13, fontWeight: 700, color: "#7a5700",
            fontFamily: "'DM Sans', system-ui, sans-serif"
          }}>
            All required documents must be uploaded before submission
          </p>
          <span style={{
            fontSize: 11, color: "#9a6f00",
            fontFamily: "'DM Sans', system-ui, sans-serif"
          }}>
            Accepted formats: PDF, JPG, PNG. Max file sizes listed per document.
          </span>
        </div>
      </div>
      <Row cols={2}>
        <Field label="Birth Certificate" required>
          <UploadBox icon="" label="Click to upload" accept=".pdf,.jpg,.png" hint="PDF, JPG, PNG — max 5MB" />
        </Field>
        <Field label="Passport Photo" required>
          <UploadBox icon="️" label="Click to upload" accept=".jpg,.png" hint="JPG, PNG — max 2MB" />
        </Field>
      </Row>
      <Row cols={2}>
        <Field label="Parent / Guardian ID" required>
          <UploadBox icon="🪪" label="Click to upload" accept=".pdf,.jpg,.png" hint="PDF, JPG, PNG — max 5MB" />
        </Field>
        <Field label="Proof of Residence" required>
          <UploadBox icon=<Home className="w-5 h-5" /> label="Click to upload" accept=".pdf,.jpg,.png" hint="Utility bill, bank statement — max 5MB" />
        </Field>
      </Row>
      <SectionTitle>Optional Documents</SectionTitle>
      <Row cols={1}>
        <Field label="Previous School Report">
          <UploadBox icon=<ClipboardList className="w-5 h-5" /> label="Click to upload previous academic report" accept=".pdf,.jpg,.png" hint="PDF, JPG, PNG — max 10MB" />
        </Field>
      </Row>
      <Row cols={1}>
        <Field label="Medical / Immunisation Records">
          <UploadBox icon="" label="Click to upload health / vaccination records" accept=".pdf,.jpg,.png" hint="PDF, JPG, PNG — max 5MB" />
        </Field>
      </Row>
    </div>
  );
}