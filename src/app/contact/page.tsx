import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contact · Arclog",
  description: "Get in touch with the Arclog team.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-margin-mobile pb-16 pt-16">
      <h1 className="mb-2 text-3xl font-bold text-on-surface">Contact Us</h1>
      <p className="mb-10 font-medium text-on-surface-variant">
        Have a question, feedback, or concern? We&apos;d love to hear from
        you.
      </p>

      <ContactForm />

      <p className="mt-10 text-sm font-medium text-on-surface-variant">
        You can also reach us directly at{" "}
        <a
          href="mailto:contact@arclog.co"
          className="font-bold text-primary hover:underline"
        >
          contact@arclog.co
        </a>
      </p>
    </main>
  );
}
