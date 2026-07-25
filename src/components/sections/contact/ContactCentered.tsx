import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { ContactDetails, ContactForm } from "@/components/sections/contact/parts";
import type { ContactContent } from "@/lib/sections/schemas";

/** Contact variant: centred details across three columns, form underneath. */
export function ContactCentered({ content }: { content: ContactContent }) {
  const { title, address, phone, email, mapEmbedUrl, showContactForm } = content;

  return (
    <SectionShell background="light">
      <SectionHeading title={title} align="center" />

      <div className="mx-auto mt-10 max-w-3xl">
        <ContactDetails
          address={address}
          phone={phone}
          email={email}
          layout="row"
        />
      </div>

      {mapEmbedUrl ? (
        <iframe
          src={mapEmbedUrl}
          title="Campus location"
          className="mt-8 h-64 w-full rounded-xl border"
          loading="lazy"
        />
      ) : null}

      {showContactForm ? (
        <div className="mx-auto mt-10 max-w-2xl">
          <ContactForm />
        </div>
      ) : null}
    </SectionShell>
  );
}
