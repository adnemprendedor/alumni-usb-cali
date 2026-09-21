import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import usbLogo from "../assets/brand/usb-logo.png";
import alumniLogo from "../assets/brand/alumni-logo.png";

const LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Explorar", href: "#explora" },
  { label: "Emprendedores", href: "#buscador" },
  { label: "Enfoques", href: "#categorias" },
  { label: "Programas", href: "#carreras" },
  { label: "Conecta", href: "#conecta" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-8 sm:pt-6">
      <motion.nav
        className="flex w-full max-w-6xl items-center justify-between rounded-full px-5 py-3 sm:px-6"
        animate={{
          backgroundColor: scrolled ? "rgba(29,29,27,0.78)" : "rgba(29,29,27,0)",
          backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
          borderColor: scrolled ? "rgba(239,125,0,0.25)" : "rgba(239,125,0,0)",
          boxShadow: scrolled ? "0 8px 30px rgba(0,0,0,0.35)" : "0 0 0 rgba(0,0,0,0)",
        }}
        style={{ borderWidth: 1, borderStyle: "solid" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to="/" className="flex items-center gap-2" data-cursor-hover>
          <span className="flex h-10 items-center gap-2.5 rounded-lg bg-paper px-2.5 py-1.5 sm:h-11">
            <img src={usbLogo} alt="Universidad de San Buenaventura Cali" className="h-full w-auto object-contain" />
            <span className="h-6 w-px shrink-0 bg-ink/15" />
            <img src={alumniLogo} alt="Alumni USB Cali" className="h-full w-auto object-contain" />
          </span>
          <span className="hidden text-[8px] uppercase leading-tight tracking-[0.1em] text-paper-dim sm:block">
            Vigilada
            <br />
            Mineducación
          </span>
        </Link>

        <ul className="hidden items-center gap-7 text-sm text-paper-dim lg:flex">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="relative transition-colors hover:text-paper" data-cursor-hover>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#explora"
          data-cursor-hover
          className="hidden rounded-full border border-gold/50 px-5 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-ink sm:inline-block"
        >
          Explorar
        </a>

        <button
          aria-label="Abrir menú"
          className="flex flex-col gap-1.5 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <motion.span
            className="h-[1.5px] w-6 bg-paper"
            animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
          />
          <motion.span className="h-[1.5px] w-6 bg-paper" animate={{ opacity: open ? 0 : 1 }} />
          <motion.span
            className="h-[1.5px] w-6 bg-paper"
            animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
          />
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-4 right-4 top-[calc(100%+0.5rem)] rounded-3xl border border-gold/15 bg-ink-2/95 p-6 backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col gap-4 text-lg text-paper">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} onClick={() => setOpen(false)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
