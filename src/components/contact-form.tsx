"use client";

import { useState } from "react";

const SUBJECTS = [
  "General",
  "Bug Report",
  "Feature Request",
  "Data & Privacy",
  "Other",
] as const;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-xl border-2 border-outline-variant bg-surface-container-lowest p-8 text-center">
        <p className="text-lg font-bold text-on-surface">Thank you!</p>
        <p className="mt-2 font-medium text-on-surface-variant">
          We&apos;ve received your message and will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-5"
    >
      <Field label="Name" id="name">
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border-2 border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition-colors focus:border-primary"
          placeholder="Your name"
        />
      </Field>

      <Field label="Email" id="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border-2 border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition-colors focus:border-primary"
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Subject" id="subject">
        <select
          id="subject"
          name="subject"
          required
          className="w-full rounded-lg border-2 border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition-colors focus:border-primary"
        >
          <option value="">Select a subject</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Message" id="message">
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full resize-none rounded-lg border-2 border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition-colors focus:border-primary"
          placeholder="How can we help?"
        />
      </Field>

      <button
        type="submit"
        className="btn-primary-tactile flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-on-primary"
      >
        Send Message
      </button>
    </form>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-on-surface">
        {label}
      </label>
      {children}
    </div>
  );
}
