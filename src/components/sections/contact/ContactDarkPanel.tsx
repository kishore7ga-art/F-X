import { ContactForm } from "@/components/sections/contact/parts";
import type { ContactContent } from "@/lib/sections/schemas";

/** Contact variant: dark full-bleed band, details left, form right. */
export function ContactDarkPanel({ content }: { content: ContactContent }) {
  const { title, address, phone, email, mapEmbedUrl, showContactForm } = content;

  const rows = [
    { label: "Address", value: address, href: null },
    { label: "Phone", value: phone, href: phone ? `tel:${phone}` : null },
    { label: "Email", value: email, href: email ? `mailto:${email}` : null },
  ].filter((row) => row.value);

  return (
    <section
      className="px-6 py-16 sm:py-20"
      style={{ backgroundColor: "var(--site-dark)" }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-[family-name:var(--site-heading-font)] text-3xl font-bold text-white sm:text-4xl">
            {title}
          </h2>
          <div
            className="mt-4 h-1 w-16 rounded"
            style={{ backgroundColor: "var(--site-accent)" }}
          />

          <dl className="mt-8 space-y-5">
            {rows.map((row) => (
              <div key={row.label}>
                <dt
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: "var(--site-accent)" }}
                >
                  {row.label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-white/80">
                  {row.href ? (
                    <a href={row.href} className="hover:underline">
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {mapEmbedUrl ? (
            <iframe
              src={mapEmbedUrl}
              title="Campus location"
              className="mt-7 h-48 w-full rounded-lg border-0"
              loading="lazy"
            />
          ) : null}
        </div>

        {showContactForm ? (
          <div className="rounded-xl bg-[var(--site-card-bg)] p-1">
            <ContactForm />
          </div>
        ) : null}
      </div>
    </section>
  );
}
