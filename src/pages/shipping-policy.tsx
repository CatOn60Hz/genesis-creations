import { PolicyLayout, PolicyContact } from "@/components/layout/policy-layout"

export function ShippingPolicy() {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      description="How Genesis Kreations Media Private Limited delivers its courses, workshops and media services. No physical products are shipped."
      effectiveDate="30 June 2026"
    >
      <h2>1. Nature of Our Offerings</h2>
      <p>
        Genesis Kreations Media Private Limited provides services and training —
        media production, photography, videography, digital marketing, live
        streaming, studio rental, media courses, and workshops. We do{" "}
        <strong className="text-cream">not sell or ship any physical goods</strong>.
        As such, no shipping charges, couriers, or physical deliveries apply to any
        purchase made through this website.
      </p>

      <h2>2. Delivery of Courses & Workshops</h2>
      <p>
        Once a course or workshop registration is confirmed and payment is
        received, joining details — such as the schedule, venue, or online access
        information — are shared with the participant by email, phone, or message,
        typically within 24 hours of payment confirmation. Sessions are delivered
        in person at our Chennai studio or online, as specified for each program.
      </p>

      <h2>3. Delivery of Media & Marketing Services</h2>
      <p>
        For media production, digital marketing, and related project-based
        services, deliverables and timelines are defined in the individual
        agreement, quotation, or invoice issued for that engagement. Final files
        and outputs are shared digitally or handed over as agreed with the client.
      </p>

      <h2>4. Access & Support</h2>
      <p>
        If you have completed a payment but have not received your confirmation or
        access details within a reasonable time, please contact us using the
        details below and we will assist you promptly.
      </p>

      <h2>5. Changes to this Policy</h2>
      <p>
        Genesis Kreations reserves the right to modify this Shipping &amp; Delivery
        Policy at any time. The latest version will be published on the website.
      </p>

      <h2>6. Contact Us</h2>
      <p>For any questions about this Shipping &amp; Delivery Policy, please contact:</p>
      <PolicyContact />
    </PolicyLayout>
  )
}
