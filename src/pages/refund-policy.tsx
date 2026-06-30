import { PolicyLayout, PolicyContact } from "@/components/layout/policy-layout"

export function RefundPolicy() {
  return (
    <PolicyLayout
      title="Refund & Cancellation Policy"
      description="Refund and cancellation terms for Genesis Kreations courses, workshops, studio rentals and media services."
      effectiveDate="30 June 2026"
    >
      <h2>1. Introduction</h2>
      <p>
        This Refund &amp; Cancellation Policy applies to all services offered by
        Genesis Kreations Media Private Limited, including media production
        services, training programs, workshops, studio rentals, and digital
        marketing services.
      </p>

      <h2>2. Course &amp; Workshop Registrations</h2>
      <p>
        Registration fees and course fees are generally non-refundable once a seat
        has been confirmed. If Genesis Kreations cancels a program, participants
        may be offered a full refund, transfer to another batch, or credit toward
        a future program.
      </p>

      <h2>3. Student Cancellations</h2>
      <p>
        If a participant is unable to attend, a request to transfer the
        registration to a future batch may be considered at the sole discretion of
        Genesis Kreations, subject to seat availability and administrative
        policies.
      </p>

      <h2>4. Media Production &amp; Digital Marketing Services</h2>
      <p>
        Advance payments made for production projects, photography, videography,
        digital marketing, branding, or consulting are non-refundable once project
        planning or work has commenced. Any refunds, if approved, will be based on
        the stage of work completed.
      </p>

      <h2>5. Studio Rental</h2>
      <p>
        Cancellations made sufficiently in advance may be eligible for
        rescheduling, subject to availability. Cancellations made close to the
        booking date or after the booked time may not qualify for a refund.
      </p>

      <h2>6. Government-Funded Training</h2>
      <p>
        For government-sponsored or institution-sponsored training programs, refund
        and cancellation terms will be governed by the applicable agreement with
        the sponsoring organization.
      </p>

      <h2>7. Exceptional Circumstances</h2>
      <p>
        Genesis Kreations may, at its sole discretion, consider refund or
        rescheduling requests arising from genuine medical emergencies or other
        exceptional circumstances when supported by appropriate documentation.
      </p>

      <h2>8. Processing of Approved Refunds</h2>
      <p>
        If a refund is approved, it will be processed through the original payment
        method or another mutually agreed method within a reasonable period,
        subject to banking timelines.
      </p>

      <h2>9. Changes to this Policy</h2>
      <p>
        Genesis Kreations reserves the right to modify this Refund &amp;
        Cancellation Policy at any time. The latest version will be published on
        the website.
      </p>

      <h2>10. Contact Us</h2>
      <p>For any questions about this Refund &amp; Cancellation Policy, please contact:</p>
      <PolicyContact />
    </PolicyLayout>
  )
}
