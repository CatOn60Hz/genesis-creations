import { PolicyLayout, PolicyContact } from "@/components/layout/policy-layout"

export function PrivacyPolicy() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      description="How Genesis Kreations Media Private Limited collects, uses and protects your personal information."
      effectiveDate="30 June 2026"
    >
      <p>
        Genesis Kreations Media Private Limited (&ldquo;Genesis Kreations&rdquo;,
        &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to
        protecting the privacy of our website visitors, students, clients,
        partners, and users. This Privacy Policy explains how we collect, use,
        disclose, and safeguard your information when you visit our website or use
        our services.
      </p>
      <p>By accessing our website, you agree to this Privacy Policy.</p>

      <h2>1. Information We Collect</h2>
      <p>
        <strong className="text-cream">Personal Information:</strong>
      </p>
      <ul>
        <li>Full Name</li>
        <li>Email Address</li>
        <li>Mobile Number</li>
        <li>Company Name</li>
        <li>Address</li>
        <li>Course or Service Enquiry Details</li>
        <li>Payment Information (processed by secure third-party payment providers)</li>
      </ul>
      <p>
        <strong className="text-cream">Technical Information:</strong>
      </p>
      <ul>
        <li>IP Address</li>
        <li>Browser Type</li>
        <li>Device Information</li>
        <li>Operating System</li>
        <li>Website Usage Statistics</li>
        <li>Pages Visited</li>
        <li>Date and Time of Visit</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use your information to respond to enquiries, process registrations and
        bookings, deliver our services, communicate updates, improve our website,
        send promotional communications where permitted, maintain security, and
        comply with legal obligations.
      </p>

      <h2>3. Cookies</h2>
      <p>
        Our website may use cookies and similar technologies to improve user
        experience, analyze traffic, and remember user preferences. You may
        disable cookies in your browser settings.
      </p>

      <h2>4. Sharing of Information</h2>
      <p>
        We do not sell your personal information. We may share it with trusted
        service providers, payment gateway providers, government authorities when
        legally required, and business partners where necessary to provide
        requested services.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We implement reasonable technical and organizational safeguards to protect
        your information. However, no system can guarantee absolute security.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain personal information only as long as necessary for business,
        legal, and regulatory purposes.
      </p>

      <h2>7. Third-Party Services</h2>
      <p>
        Our website may contain links to third-party websites or services. We are
        not responsible for their privacy practices.
      </p>

      <h2>8. Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal
        information where permitted by law, withdraw consent where applicable, and
        opt out of promotional communications.
      </p>

      <h2>9. Children&rsquo;s Privacy</h2>
      <p>
        Our services are not intended for children without appropriate parental or
        guardian consent where required.
      </p>

      <h2>10. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The latest version
        will always be available on our website.
      </p>

      <h2>11. Contact Us</h2>
      <p>For any questions about this Privacy Policy, please contact:</p>
      <PolicyContact />
    </PolicyLayout>
  )
}
