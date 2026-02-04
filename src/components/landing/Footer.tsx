import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin } from "lucide-react";
import chatveroLogo from "@/assets/chatvero-logo.png";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
    { name: "Integrations", href: "#" },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "Documentation", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "Status", href: "#" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export const Footer = () => {
  return (
    <footer className="relative bg-card/50 backdrop-blur-sm border-t border-border/50">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 sm:gap-10 mb-12 sm:mb-16">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-14 h-14"
              >
                <img src={chatveroLogo} alt="Chatvero" className="w-full h-full object-contain" />
              </motion.div>
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight">Chatvero</span>
            </Link>
            <p className="text-muted-foreground text-xs sm:text-sm mb-6 sm:mb-8 max-w-xs leading-relaxed">
              Turn your website into an AI-powered lead generation machine. No coding required.
            </p>
            <div className="flex gap-2 sm:gap-3">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary/80 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <h4 className="font-semibold mb-3 sm:mb-5 capitalize text-xs sm:text-sm tracking-wide">{category}</h4>
              <ul className="space-y-2 sm:space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground text-xs sm:text-sm transition-colors duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 sm:pt-10 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} Chatvero. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
            Made with <span className="text-red-500">❤️</span> for businesses that want to grow
          </p>
        </div>
      </div>
    </footer>
  );
};
