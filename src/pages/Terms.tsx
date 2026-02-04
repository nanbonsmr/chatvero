import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using Chatvero's services, website, or any associated applications (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.

These Terms apply to all visitors, users, and others who access or use the Service. By using our Service, you represent that you are at least 18 years old and have the legal authority to enter into these Terms.`,
  },
  {
    title: "2. Description of Service",
    content: `Chatvero provides an AI-powered chat widget platform that enables businesses to engage with website visitors, capture leads, and provide automated customer support. Our Service includes:

• AI chatbot creation and customization tools
• Website widget integration and deployment
• Lead capture and management features
• Analytics and reporting dashboards
• API access and integrations (where applicable)

We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice.`,
  },
  {
    title: "3. Account Registration",
    content: `To use certain features of our Service, you must register for an account. When registering, you agree to:

• Provide accurate, current, and complete information
• Maintain and promptly update your account information
• Keep your password secure and confidential
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use

We reserve the right to suspend or terminate accounts that violate these Terms or contain inaccurate information.`,
  },
  {
    title: "4. Subscription and Payments",
    content: `Certain features of our Service require a paid subscription. By subscribing, you agree to:

• Pay all fees associated with your chosen plan
• Provide valid payment information
• Authorize us to charge your payment method on a recurring basis
• Accept that prices may change with 30 days' notice

**Billing**: Subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable except as expressly stated in these Terms.

**Cancellation**: You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial periods.

**Free Trials**: If you sign up for a free trial, you will be automatically enrolled in a paid subscription unless you cancel before the trial ends.`,
  },
  {
    title: "5. Acceptable Use",
    content: `You agree not to use the Service to:

• Violate any applicable laws or regulations
• Infringe upon intellectual property rights of others
• Transmit harmful, offensive, or illegal content
• Attempt to gain unauthorized access to our systems
• Interfere with or disrupt the Service or servers
• Impersonate any person or entity
• Collect user data without proper consent
• Send spam or unsolicited communications
• Use the Service for any fraudulent purpose

We reserve the right to investigate and take appropriate action against anyone who violates these restrictions.`,
  },
  {
    title: "6. Intellectual Property",
    content: `**Our Property**: The Service, including all content, features, and functionality, is owned by Chatvero and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express permission.

**Your Content**: You retain ownership of content you submit through the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content as necessary to provide the Service.

**Feedback**: Any feedback, suggestions, or ideas you provide may be used by us without any obligation to compensate you.`,
  },
  {
    title: "7. Data and Privacy",
    content: `Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of information as described in our Privacy Policy.

**Your Data**: You are responsible for the data you collect through the Service. You agree to comply with all applicable data protection laws and obtain necessary consents from your end users.

**Data Processing**: We process data on your behalf as a data processor. Our data processing practices are described in our Data Processing Agreement, available upon request.`,
  },
  {
    title: "8. Disclaimer of Warranties",
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:

• MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
• NON-INFRINGEMENT
• ACCURACY OR RELIABILITY OF CONTENT
• UNINTERRUPTED OR ERROR-FREE SERVICE

We do not guarantee that the AI-generated responses will be accurate, complete, or appropriate for any particular use case. You are responsible for reviewing and verifying all AI outputs.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, CHATVERO SHALL NOT BE LIABLE FOR:

• Indirect, incidental, special, consequential, or punitive damages
• Loss of profits, data, use, or goodwill
• Damages resulting from unauthorized access to your data
• Any amount exceeding the fees paid by you in the 12 months preceding the claim

This limitation applies regardless of the legal theory and even if we have been advised of the possibility of such damages.`,
  },
  {
    title: "10. Indemnification",
    content: `You agree to indemnify, defend, and hold harmless Chatvero and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:

• Your use of the Service
• Your violation of these Terms
• Your violation of any third-party rights
• Content you submit through the Service
• Your interactions with your end users`,
  },
  {
    title: "11. Termination",
    content: `We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including:

• Breach of these Terms
• Non-payment of fees
• Request by law enforcement
• Discontinuation of the Service

Upon termination, your right to use the Service will immediately cease. We may delete your data in accordance with our data retention policies.`,
  },
  {
    title: "12. Changes to Terms",
    content: `We reserve the right to modify these Terms at any time. We will notify you of material changes by:

• Posting the updated Terms on our website
• Sending an email to your registered address
• Displaying a notice within the Service

Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms.`,
  },
  {
    title: "13. Governing Law",
    content: `These Terms are governed by the laws of the State of California, without regard to conflict of law principles. Any disputes arising from these Terms will be resolved exclusively in the state or federal courts located in San Francisco County, California.

You agree to submit to the personal jurisdiction of these courts and waive any objections based on venue or inconvenient forum.`,
  },
  {
    title: "14. Contact Information",
    content: `If you have any questions about these Terms, please contact us:

• **Email**: legal@chatvero.com
• **Mail**: Chatvero Inc., 123 Market Street, San Francisco, CA 94105

We will respond to your inquiry within a reasonable timeframe.`,
  },
];

const Terms = () => {
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
                Terms of Service
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
                  Please read these Terms of Service carefully before using Chatvero. These terms govern your access to and use of our services.
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

export default Terms;
