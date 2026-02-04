import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const sections = [
  {
    title: "Information We Collect",
    content: `We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This information may include:

• **Account Information**: Name, email address, password, and company information
• **Payment Information**: Billing address and payment method details (processed securely by our payment providers)
• **Usage Data**: Information about how you use our services, including chat conversations and widget interactions
• **Device Information**: IP address, browser type, operating system, and device identifiers

We also automatically collect certain information when visitors interact with widgets powered by Chatvero, including conversation content, page URLs, and basic device information.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send technical notices, updates, security alerts, and support messages
• Respond to your comments, questions, and customer service requests
• Monitor and analyze trends, usage, and activities in connection with our services
• Detect, investigate, and prevent fraudulent transactions and other illegal activities
• Personalize and improve your experience
• Train and improve our AI models (with anonymized data only)`,
  },
  {
    title: "Information Sharing",
    content: `We do not sell, trade, or otherwise transfer your personally identifiable information to third parties without your consent, except in the following circumstances:

• **Service Providers**: We share information with third-party vendors who perform services on our behalf, such as payment processing, data analysis, and customer support
• **Legal Requirements**: We may disclose information if required by law or in response to valid legal requests
• **Business Transfers**: In connection with a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity
• **With Your Consent**: We may share information with your consent or at your direction`,
  },
  {
    title: "Data Security",
    content: `We implement appropriate technical and organizational measures to protect your personal information, including:

• Encryption of data in transit and at rest using industry-standard protocols
• Regular security assessments and penetration testing
• Access controls and authentication mechanisms
• Employee training on data protection and security practices
• Incident response procedures for potential data breaches

While we strive to protect your information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.`,
  },
  {
    title: "Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide you services. We will also retain and use your information as necessary to:

• Comply with our legal obligations
• Resolve disputes
• Enforce our agreements
• Protect against fraudulent or illegal activity

You may request deletion of your data at any time by contacting us or through your account settings. Some information may be retained in anonymized form for analytics purposes.`,
  },
  {
    title: "Your Rights",
    content: `Depending on your location, you may have certain rights regarding your personal information:

• **Access**: Request a copy of the personal information we hold about you
• **Correction**: Request correction of inaccurate or incomplete information
• **Deletion**: Request deletion of your personal information
• **Portability**: Request a copy of your data in a portable format
• **Objection**: Object to certain processing of your information
• **Restriction**: Request restriction of processing in certain circumstances

To exercise these rights, please contact us at privacy@chatvero.com.`,
  },
  {
    title: "International Data Transfers",
    content: `Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country.

We ensure appropriate safeguards are in place when transferring data internationally, including:

• Standard contractual clauses approved by relevant authorities
• Certification under recognized privacy frameworks
• Consent where required by applicable law`,
  },
  {
    title: "Children's Privacy",
    content: `Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that a child under 16 has provided us with personal information, we will take steps to delete such information.

If you believe we have collected information from a child under 16, please contact us immediately.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

We encourage you to review this Privacy Policy periodically for any changes. Your continued use of our services after the posting of changes constitutes your acceptance of such changes.`,
  },
  {
    title: "Contact Us",
    content: `If you have any questions about this Privacy Policy or our data practices, please contact us:

• **Email**: privacy@chatvero.com
• **Mail**: Chatvero Inc., 123 Market Street, San Francisco, CA 94105
• **Data Protection Officer**: dpo@chatvero.com

We will respond to your inquiry within 30 days.`,
  },
];

const Privacy = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(234 89% 58% / 0.03), transparent 40%)`,
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      <Navbar />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-12 sm:pt-40 sm:pb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 sm:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">
                Last updated: February 4, 2026
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 sm:py-16 relative">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  At Chatvero, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                </p>

                {sections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="mb-10"
                  >
                    <h2 className="font-display font-bold text-xl sm:text-2xl mb-4 text-foreground">
                      {section.title}
                    </h2>
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
