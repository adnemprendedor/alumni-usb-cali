import { type ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ScrollTrigger } from "../lib/gsap";

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, scale: 1.01, clipPath: "inset(4% 4% 4% 4% round 24px)" }}
      animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 0px)" }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
