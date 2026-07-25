import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { ContactDetails, ContactForm } from "@/components/sections/contact/parts";
import type { ContactContent } from "@/lib/sections/schemas";

/** Contact variant: edge-to-edge map strip, details and form above it. */
export function ContactFullWidthMap({ content }: { content: ContactContent }) {
  const { title, address, phone, email, mapEmbedUrl, showContactForm } = content;

  return (
    <section>
      <SectionShell background="white">
        <SectionHeading title={title} />

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <ContactDetails address={address} phone={phone} email={email} />
          {showContactForm ? <ContactForm /> : null}
        </div>
      </SectionShell>

      {mapEmbedUrl ? (
        <iframe
          src={mapEmbedUrl}
          title="Campus location"
          className="block h-80 w-full border-0"
          loading="lazy"
        />
      ) : (
        <div
          className="flex h-24 w-full items-center justify-center text-xs font-semibold uppercase tracking-widest text-white/70"
          style={{ backgroundColor: "var(--site-primary)" }}
        >
          {address || "Campus location"}
        </div>
      )}
    </section>
  );
}
