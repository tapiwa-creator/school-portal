import { Field, Row, SectionTitle, Input, Select, Textarea } from "../Components/FormComponents";

export default function StepParent({ data, update }) {
  return (
    <div>
      <SectionTitle>Primary Guardian Details</SectionTitle>
      <Row cols={3}>
        <Field label="First Name" required>
          <Input
            placeholder="e.g. John"
            value={data.pFirstName || ""}
            onChange={e => update("pFirstName", e.target.value)}
          />
        </Field>
        <Field label="Last Name" required>
          <Input
            placeholder="e.g. Moyo"
            value={data.pLastName || ""}
            onChange={e => update("pLastName", e.target.value)}
          />
        </Field>
        <Field label="Relationship" required>
          <Select value={data.relationship || ""} onChange={e => update("relationship", e.target.value)}>
            <option value="">Select</option>
            <option>Mother</option>
            <option>Father</option>
            <option>Legal Guardian</option>
            <option>Grandparent</option>
            <option>Other</option>
          </Select>
        </Field>
      </Row>
      <Row cols={2}>
        <Field label="Phone Number" required hint="Include country code e.g. +263">
          <Input
            type="tel"
            placeholder="+263 77 123 4567"
            value={data.phone || ""}
            onChange={e => update("phone", e.target.value)}
          />
        </Field>
        <Field label="Email Address" required>
          <Input
            type="email"
            placeholder="parent@email.com"
            value={data.email || ""}
            onChange={e => update("email", e.target.value)}
          />
        </Field>
      </Row>
      <Row cols={2}>
        <Field label="National ID Number" required>
          <Input
            placeholder="e.g. 63-1234567A00"
            value={data.pNatId || ""}
            onChange={e => update("pNatId", e.target.value)}
          />
        </Field>
        <Field label="Occupation">
          <Input
            placeholder="e.g. Teacher"
            value={data.occupation || ""}
            onChange={e => update("occupation", e.target.value)}
          />
        </Field>
      </Row>
      <Row cols={1}>
        <Field label="Residential Address" required>
          <Textarea
            placeholder="Street, Suburb, City…"
            value={data.address || ""}
            onChange={e => update("address", e.target.value)}
          />
        </Field>
      </Row>

      <SectionTitle>Secondary Guardian (Optional)</SectionTitle>
      <Row cols={3}>
        <Field label="First Name">
          <Input
            placeholder="e.g. Mary"
            value={data.s2First || ""}
            onChange={e => update("s2First", e.target.value)}
          />
        </Field>
        <Field label="Last Name">
          <Input
            placeholder="e.g. Moyo"
            value={data.s2Last || ""}
            onChange={e => update("s2Last", e.target.value)}
          />
        </Field>
        <Field label="Relationship">
          <Select value={data.s2Rel || ""} onChange={e => update("s2Rel", e.target.value)}>
            <option value="">Select</option>
            <option>Mother</option>
            <option>Father</option>
            <option>Guardian</option>
            <option>Other</option>
          </Select>
        </Field>
      </Row>
      <Row cols={2}>
        <Field label="Phone Number" hint="Include country code">
          <Input
            type="tel"
            placeholder="+263 77 000 0000"
            value={data.s2Phone || ""}
            onChange={e => update("s2Phone", e.target.value)}
          />
        </Field>
        <Field label="Email Address">
          <Input
            type="email"
            placeholder="secondary@email.com"
            value={data.s2Email || ""}
            onChange={e => update("s2Email", e.target.value)}
          />
        </Field>
      </Row>

      <SectionTitle>Emergency Contact</SectionTitle>
      <Row cols={2}>
        <Field label="Contact Name" required>
          <Input
            placeholder="Full name"
            value={data.ecName || ""}
            onChange={e => update("ecName", e.target.value)}
          />
        </Field>
        <Field label="Phone Number" required>
          <Input
            type="tel"
            placeholder="+263…"
            value={data.ecPhone || ""}
            onChange={e => update("ecPhone", e.target.value)}
          />
        </Field>
      </Row>
      <Row cols={1}>
        <Field label="Relation to Child" required>
          <Select value={data.ecRel || ""} onChange={e => update("ecRel", e.target.value)}>
            <option value="">Select relation</option>
            <option>Aunt</option>
            <option>Uncle</option>
            <option>Grandparent</option>
            <option>Family Friend</option>
            <option>Other</option>
          </Select>
        </Field>
      </Row>
    </div>
  );
}