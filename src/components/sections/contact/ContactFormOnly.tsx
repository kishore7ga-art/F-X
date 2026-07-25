import { SectionHeading, SectionShell } from "@/components/sections/SectionShell";
import { ContactDetails, ContactForm } from "@/components/sections/contact/parts";
import type { ContactContent } from "@/lib/sections/schemas";

/** Contact variant: enquiry form front and centre, details reduced to a
 * single line beneath. */
export function ContactFormOnly({ content }: { content: ContactContent }) {
  const { title, address, phone, email, showContactForm } = content;

  return (
    <SectionShell background="light">
      <SectionHeading title={title} align="center" />

      <div className="mx-auto mt-10 max-w-2xl">
        {showContactForm ? (
          <ContactForm />
        ) : (
          <p className="text-center text-sm opacity-60">
            Reach us using the details below.
          </p>
        )}

        <div className="mt-8 border-t pt-6">
          <ContactDetails
            address={address}
            phone={phone}
            email={email}
            layout="row"
          />
        </div>
      </div>
    </SectionShell>
  );
}
