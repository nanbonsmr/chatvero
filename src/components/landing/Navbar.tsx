import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageSquare, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 py-3 sm:py-4"
    >
      <div className="mx-2 sm:mx-4 md:mx-8 rounded-xl sm:rounded-2xl bg-background/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] border border-border/50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                <motion.div 
                  className="absolute -top-1 -right-1 hidden sm:block"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3 text-accent" />
                </motion.div>
              </motion.div>
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight">Chatvero</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                  className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-1/2 transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ThemeToggle />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    className="font-medium hover:bg-secondary/80"
                  >
                    Log in
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to="/signup">
                  <Button className="gradient-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 font-medium">
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-secondary/80 hover:bg-secondary transition-colors"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden mx-2 sm:mx-4 mt-2 rounded-xl sm:rounded-2xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl overflow-hidden"
          >
            <div className="p-3 sm:p-4 space-y-1">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="block px-3 sm:px-4 py-2.5 sm:py-3 text-foreground hover:bg-secondary/80 rounded-lg sm:rounded-xl transition-colors font-medium text-sm sm:text-base"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </motion.a>
              ))}
              <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border space-y-2 sm:space-y-3">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full justify-center h-10 sm:h-11 text-sm sm:text-base">Log in</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full justify-center h-10 sm:h-11 text-sm sm:text-base gradient-primary text-primary-foreground shadow-lg shadow-primary/25">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
