import { Field, RadioGroup, CheckItem, Row, SectionTitle, Input, Select } from "../Components/FormComponents";
import { C } from "../Components/FormComponents";

export default function StepEligibility({ data, update }) {
  return (
    <div>
      <SectionTitle>Eligibility Criteria</SectionTitle>
      <div style={{
        background: C.greenLight, borderRadius: 12, padding: 20, marginBottom: 20,
        fontSize: 14, color: C.textMid, lineHeight: 1.7,
        fontFamily: "'DM Sans', system-ui, sans-serif"
      }}>
        <p style={{ fontWeight: 700, color: C.greenMid, marginBottom: 8 }}>
          Before you apply, please confirm the following:
        </p>
        <ul style={{ paddingLeft: 18 }}>
          <li>The child is between 5 and 14 years old</li>
          <li>The child is a resident or citizen of Zimbabwe</li>
          <li>You have the child's birth certificate available</li>
          <li>You accept Corner Stone's code of conduct</li>
        </ul>
      </div>
      <Row cols={2}>
        <Field label="Child's Age (years)" required>
          <Input
            type="number"
            min={5}
            max={14}
            placeholder="e.g. 7"
            value={data.age || ""}
            onChange={e => update("age", e.target.value)}
          />
        </Field>
        <Field label="Country of Residence" required>
          <Select value={data.country || ""} onChange={e => update("country", e.target.value)}>
            <option value="">Select country</option>
            <option>Zimbabwe</option>
            <option>South Africa</option>
            <option>Zambia</option>
            <option>Other</option>
          </Select>
        </Field>
      </Row>
      <Row cols={1}>
        <Field label="Does the child have a valid birth certificate?" required>
          <RadioGroup
            options={["Yes", "No", "In Progress"]}
            value={data.hasCert || ""}
            onChange={v => update("hasCert", v)}
          />
        </Field>
      </Row>
      <Row cols={1}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <CheckItem
            checked={!!data.acceptCode}
            onChange={e => update("acceptCode", e.target.checked)}
          >
            I accept Corner Stone Primary School's <span style={{ color: C.greenAccent, cursor: "pointer" }}>Code of Conduct</span>
          </CheckItem>
          <CheckItem
            checked={!!data.acceptPrivacy}
            onChange={e => update("acceptPrivacy", e.target.checked)}
          >
            I agree to the <span style={{ color: C.greenAccent, cursor: "pointer" }}>Privacy Policy</span> and data processing terms
          </CheckItem>
        </div>
      </Row>
    </div>
  );
}