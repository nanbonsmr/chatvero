import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const sections = [
  {
    title: "What Are Cookies",
    content: `Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.

Cookies can be "persistent" or "session" cookies:
• **Persistent cookies** remain on your device for a set period or until you delete them
• **Session cookies** are deleted when you close your web browser

Cookies can also be first-party (set by us) or third-party (set by other companies).`,
  },
  {
    title: "How We Use Cookies",
    content: `We use cookies and similar tracking technologies for several purposes:

**Essential Cookies**
These cookies are necessary for the website to function properly. They enable basic functions like page navigation, secure areas access, and remembering your login status. The website cannot function properly without these cookies.

**Analytics Cookies**
We use analytics cookies to understand how visitors interact with our website. This helps us improve our website and services. These cookies collect information such as:
• Pages visited and time spent on each page
• How you arrived at our website
• Features and content you interact with
• Error messages you encounter

**Functional Cookies**
These cookies enable enhanced functionality and personalization, such as:
• Remembering your preferences and settings
• Storing your language preferences
• Remembering your login information
• Personalizing content based on your interests

**Marketing Cookies**
We may use marketing cookies to:
• Track the effectiveness of our advertising campaigns
• Deliver relevant advertisements to you
• Limit the number of times you see an advertisement
• Help us measure the effectiveness of advertising campaigns`,
  },
  {
    title: "Cookies We Use",
    content: `Here is a detailed list of the cookies we use:

**Strictly Necessary Cookies**
| Cookie Name | Purpose | Duration |
|-------------|---------|----------|
| session_id | Maintains your session state | Session |
| csrf_token | Security protection against CSRF attacks | Session |
| auth_token | Keeps you logged in | 30 days |

**Analytics Cookies**
| Cookie Name | Purpose | Duration |
|-------------|---------|----------|
| _ga | Google Analytics - distinguishes users | 2 years |
| _gid | Google Analytics - distinguishes users | 24 hours |
| _gat | Google Analytics - throttles request rate | 1 minute |

**Functional Cookies**
| Cookie Name | Purpose | Duration |
|-------------|---------|----------|
| theme | Remembers your theme preference | 1 year |
| language | Stores your language preference | 1 year |
| dismissed_banners | Tracks which notifications you've dismissed | 30 days |

**Marketing Cookies**
| Cookie Name | Purpose | Duration |
|-------------|---------|----------|
| _fbp | Facebook pixel for ad tracking | 90 days |
| _gcl_au | Google Ads conversion tracking | 90 days |`,
  },
  {
    title: "Third-Party Cookies",
    content: `Some cookies on our website are set by third-party services. We use the following third-party services that may set cookies:

**Analytics Providers**
• Google Analytics - Website traffic analysis
• Mixpanel - User behavior analytics
• Hotjar - User experience insights

**Advertising Partners**
• Google Ads - Advertising and remarketing
• Facebook Pixel - Social media advertising
• LinkedIn Insight Tag - B2B advertising

**Functionality Providers**
• Intercom - Customer support chat
• Stripe - Payment processing

These third parties may use cookies to track your activity across different websites. We recommend reviewing their respective privacy policies.`,
  },
  {
    title: "Managing Cookies",
    content: `You have several options for managing cookies:

**Browser Settings**
Most web browsers allow you to control cookies through their settings. You can usually:
• View what cookies are stored and delete them
• Block cookies from specific websites
• Block all cookies
• Block third-party cookies
• Delete all cookies when you close your browser

Here are links to cookie settings for common browsers:
• Chrome: chrome://settings/cookies
• Firefox: about:preferences#privacy
• Safari: Preferences > Privacy
• Edge: Settings > Privacy, search, and services

**Cookie Consent Tool**
When you first visit our website, you will see a cookie consent banner. You can use this to:
• Accept all cookies
• Reject non-essential cookies
• Customize your preferences

You can change your preferences at any time by clicking the "Cookie Settings" link in our website footer.

**Opt-Out Links**
• Google Analytics: tools.google.com/dlpage/gaoptout
• Facebook: www.facebook.com/settings?tab=ads
• Google Ads: adssettings.google.com`,
  },
  {
    title: "Impact of Disabling Cookies",
    content: `If you disable cookies, some features of our website may not work properly:

• You may not be able to log in or stay logged in
• Your preferences and settings may not be saved
• Some interactive features may not function
• We may not be able to remember your cookie preferences

Essential cookies cannot be disabled as they are necessary for the basic functionality of our website.`,
  },
  {
    title: "Do Not Track",
    content: `Some browsers have a "Do Not Track" (DNT) feature that lets you tell websites you visit that you do not want to be tracked.

Currently, there is no industry standard for how websites should respond to DNT signals. Our website does not currently respond to DNT signals, but you can use the cookie management tools described above to control tracking.`,
  },
  {
    title: "Updates to This Policy",
    content: `We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.

When we make changes:
• We will update the "Last Updated" date at the top of this policy
• For significant changes, we may notify you via email or a prominent notice on our website

We encourage you to review this policy periodically to stay informed about how we use cookies.`,
  },
  {
    title: "Contact Us",
    content: `If you have any questions about our use of cookies or this Cookie Policy, please contact us:

• **Email**: privacy@chatvero.com
• **Mail**: Chatvero Inc., 123 Market Street, San Francisco, CA 94105

For general privacy inquiries, please see our Privacy Policy.`,
  },
];

const CookiePolicy = () => {
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
                Cookie Policy
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
                  This Cookie Policy explains how Chatvero uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
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

export default CookiePolicy;
