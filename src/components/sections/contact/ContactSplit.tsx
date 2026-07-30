import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { ContactDetails, ContactForm } from "@/components/sections/contact/parts";
import type { ContactContent } from "@/lib/sections/schemas";

/** Contact variant: details + map on the left, enquiry form on the right. */
export function ContactSplit({ content }: { content: ContactContent }) {
  const { title, address, phone, email, mapEmbedUrl, showContactForm } = content;

  return (
    <SectionShell background="white">
      <SectionHeading title={title} />

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <ContactDetails address={address} phone={phone} email={email} />
          {mapEmbedUrl ? (
            <iframe
              src={mapEmbedUrl}
              title="Campus location"
              className="mt-6 h-64 w-full rounded-xl border"
              loading="lazy"
            />
          ) : null}
        </div>

        {showContactForm ? <ContactForm /> : null}
      </div>
    </SectionShell>
  );
}
