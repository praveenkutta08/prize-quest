import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Field,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";

/**
 * Regression guard for the Phase 5 `FieldLabelContext` fix: a `Field`'s visible
 * `<label>` must become the accessible name of the control it wraps — even for
 * non-native controls (a Radix Select `<button>`) that `htmlFor` can't reach.
 * `getByRole(role, { name })` runs the real accessible-name algorithm, so these
 * fail if the context wiring regresses.
 */
describe("Field labels its control for assistive tech", () => {
  function WrappedSelect() {
    return (
      <Field label="Category">
        <Select defaultValue="electronics">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="electronics">Electronics</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    );
  }

  it("names a wrapped Select from the field label", () => {
    render(<WrappedSelect />);
    expect(screen.getByRole("combobox", { name: "Category" })).toBeInTheDocument();
  });

  it("names a wrapped Input from the field label", () => {
    render(
      <Field label="Base URL">
        <Input />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Base URL" })).toBeInTheDocument();
  });

  it("names a wrapped Textarea from the field label", () => {
    render(
      <Field label="Notes">
        <Textarea />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Notes" })).toBeInTheDocument();
  });

  it("keeps native htmlFor association when the field provides an id", () => {
    render(
      <Field label="Email" htmlFor="e-mail">
        <Input id="e-mail" />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
  });

  it("lets an explicit aria-label win over the context label", () => {
    render(
      <Field label="Category">
        <Select defaultValue="a">
          <SelectTrigger aria-label="Reward category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
      </Field>,
    );
    expect(screen.getByRole("combobox", { name: "Reward category" })).toBeInTheDocument();
  });
});
