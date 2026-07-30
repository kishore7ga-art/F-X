/** Pieces shared by the contact section variants. */

export function ContactDetails({
  address,
  phone,
  email,
  layout = "column",
}: {
  address: string;
  phone: string;
  email: string;
  layout?: "column" | "row";
}) {
  const items = [
    { label: "Address", value: address, href: null },
    { label: "Phone", value: phone, href: phone ? `tel:${phone}` : null },
    { label: "Email", value: email, href: email ? `mailto:${email}` : null },
  ].filter((item) => item.value);

  return (
    <dl
      className={
        layout === "row"
          ? "grid gap-6 text-center sm:grid-cols-3"
          : "space-y-5"
      }
    >
      {items.map((item) => (
        <div key={item.label}>
          <dt
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--site-accent)" }}
          >
            {item.label}
          </dt>
          <dd className="mt-1 text-sm leading-relaxed opacity-85">
            {item.href ? (
              <a href={item.href} className="hover:underline">
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Enquiry form UI. Submission is not wired to a backend in this MVP — the spec
 * lists "contact form" as a section field, not as a lead-capture feature.
 */
export function ContactForm() {
  return (
    <form className="space-y-4 rounded-xl bg-[var(--site-light)] p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" />
        <Field label="Email" name="email" type="email" />
      </div>
      <Field label="Subject" name="subject" />
      <div>
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1 w-full rounded-md border border-black/10 bg-[var(--site-card-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--site-secondary)]"
        />
      </div>
      <button
        type="submit"
        className="rounded-md px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ backgroundColor: "var(--site-primary)" }}
      >
        Send enquiry
      </button>
    </form>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-semibold opacity-70">
      {children}
    </label>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        type={type}
        className="mt-1 w-full rounded-md border border-black/10 bg-[var(--site-card-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--site-secondary)]"
      />
    </div>
  );
}
