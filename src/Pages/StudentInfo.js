import { Field, CheckItem, Row, SectionTitle, Input, Select, Textarea, RadioGroup } from "../Components/FormComponents";

export default function StepStudentInfo({ data, update }) {
  const needs = data.specialNeeds || {};
  const toggleNeed = key => update("specialNeeds", { ...needs, [key]: !needs[key] });

  return (
    <div>
      <SectionTitle>Personal Details</SectionTitle>
      <Row cols={3}>
        <Field label="First Name" required>
          <Input
            placeholder="e.g. Emma"
            value={data.firstName || ""}
            onChange={e => update("firstName", e.target.value)}
          />
        </Field>
        <Field label="Middle Name">
          <Input
            placeholder="Optional"
            value={data.middleName || ""}
            onChange={e => update("middleName", e.target.value)}
          />
        </Field>
        <Field label="Last Name" required>
          <Input
            placeholder="e.g. Kamau"
            value={data.lastName || ""}
            onChange={e => update("lastName", e.target.value)}
          />
        </Field>
      </Row>
      <Row cols={2}>
        <Field label="Date of Birth" required>
          <Input
            type="date"
            value={data.dob || ""}
            onChange={e => update("dob", e.target.value)}
          />
        </Field>
        <Field label="Gender" required>
          <RadioGroup
            options={["Male", "Female", "Other"]}
            value={data.gender || ""}
            onChange={v => update("gender", v)}
          />
        </Field>
      </Row>
      <Row cols={2}>
        <Field label="Nationality" required>
          <Select value={data.nationality || ""} onChange={e => update("nationality", e.target.value)}>
            <option value="">Select nationality</option>
            <option>Zimbabwean</option>
            <option>South African</option>
            <option>Zambian</option>
            <option>British</option>
            <option>Other</option>
          </Select>
        </Field>
        <Field label="Birth Certificate No." required hint="Enter the child's official identification number">
          <Input
            placeholder="e.g. 63-1234567A00"
            value={data.certNo || ""}
            onChange={e => update("certNo", e.target.value)}
          />
        </Field>
      </Row>
      <Row cols={2}>
        <Field label="Religion">
          <Select value={data.religion || ""} onChange={e => update("religion", e.target.value)}>
            <option value="">Select (optional)</option>
            <option>Christianity</option>
            <option>Islam</option>
            <option>Hinduism</option>
            <option>Other</option>
          </Select>
        </Field>
        <Field label="Home Language" required>
          <Select value={data.language || ""} onChange={e => update("language", e.target.value)}>
            <option value="">Select language</option>
            <option>Shona</option>
            <option>Ndebele</option>
            <option>English</option>
            <option>Other</option>
          </Select>
        </Field>
      </Row>

      <SectionTitle>Academic Details</SectionTitle>
      <Row cols={2}>
        <Field label="Applying for Grade" required>
          <Select value={data.grade || ""} onChange={e => update("grade", e.target.value)}>
            <option value="">Select grade</option>
            {["Grade 1 (ECD)", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map(g => (
              <option key={g}>{g}</option>
            ))}
          </Select>
        </Field>
        <Field label="Academic Year" required>
          <Select value={data.year || "2025 / 2026"} onChange={e => update("year", e.target.value)}>
            <option>2025 / 2026</option>
            <option>2026 / 2027</option>
          </Select>
        </Field>
      </Row>
      <Row cols={2}>
        <Field label="Term Preference" required>
          <Select value={data.term || ""} onChange={e => update("term", e.target.value)}>
            <option value="">Select intake term</option>
            <option>Term 1 (January)</option>
            <option>Term 2 (May)</option>
            <option>Term 3 (September)</option>
          </Select>
        </Field>
        <Field label="Previous School (if any)">
          <Input
            placeholder="Name of previous school"
            value={data.prevSchool || ""}
            onChange={e => update("prevSchool", e.target.value)}
          />
        </Field>
      </Row>
      <Row cols={1}>
        <Field label="Previous Grade Completed">
          <Select value={data.prevGrade || ""} onChange={e => update("prevGrade", e.target.value)}>
            <option value="">Not applicable / First time enrolled</option>
            {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"].map(g => (
              <option key={g}>{g}</option>
            ))}
          </Select>
        </Field>
      </Row>

      <SectionTitle>Health & Special Needs</SectionTitle>
      <Row cols={1}>
        <Field label="Known Medical Conditions or Allergies">
          <Textarea
            placeholder="Describe any medical conditions, allergies, or special health requirements…"
            value={data.medical || ""}
            onChange={e => update("medical", e.target.value)}
          />
        </Field>
      </Row>
      <Row cols={1}>
        <Field label="Special Educational Needs">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            {[
              ["dyslexia", "Learning Disabilities (e.g. Dyslexia)"],
              ["physical", "Physical Disability"],
              ["speech", "Speech / Language Support"],
              ["gifted", "Gifted / Advanced Learner"],
              ["none", "None of the above"]
            ].map(([k, l]) => (
              <CheckItem key={k} checked={!!needs[k]} onChange={() => toggleNeed(k)}>
                {l}
              </CheckItem>
            ))}
          </div>
        </Field>
      </Row>
    </div>
  );
}