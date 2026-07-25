import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { ContactForm } from "@/components/sections/contact/parts";
import type { ContactContent } from "@/lib/sections/schemas";

/** Contact variant: address / phone / email as three cards, form beneath. */
export function ContactCardsRow({ content }: { content: ContactContent }) {
  const { title, address, phone, email, showContactForm } = content;

  const cards = [
    { label: "Visit", value: address, href: null },
    { label: "Call", value: phone, href: phone ? `tel:${phone}` : null },
    { label: "Email", value: email, href: email ? `mailto:${email}` : null },
  ].filter((card) => card.value);

  return (
    <SectionShell background="light">
      <SectionHeading title={title} align="center" />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border-b-4 bg-white p-6 text-center shadow-sm"
            style={{ borderBottomColor: "var(--site-accent)" }}
          >
            <h3
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--site-secondary)" }}
            >
              {card.label}
            </h3>
            <p className="mt-3 text-sm leading-relaxed opacity-85">
              {card.href ? (
                <a href={card.href} className="hover:underline">
                  {card.value}
                </a>
              ) : (
                card.value
              )}
            </p>
          </div>
        ))}
      </div>

      {showContactForm ? (
        <div className="mx-auto mt-10 max-w-2xl">
          <ContactForm />
        </div>
      ) : null}
    </SectionShell>
  );
}
