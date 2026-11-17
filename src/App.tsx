import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollProgress from "./components/ScrollProgress";
import CustomCursor from "./components/CustomCursor";
import PageTransition from "./components/PageTransition";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import JuegoPage from "./pages/JuegoPage";
import LineaPage from "./pages/LineaPage";
import { rutaDeSeccion } from "./pages/secciones";
import { RUTAS } from "./data/sitio";
import AdminApp from "./admin/AdminApp";

/**
 * In-page section links (navbar, CTAs, category cards…) are plain
 * `<a href="#id">` tags. Because the app itself is mounted on a
 * HashRouter (needed so deep links like /egresado/slug work on a
 * static host), a raw hash change would be swallowed by the router as
 * a "navigation". This intercepts those clicks and turns them into a
 * smooth scroll instead, routing home first if needed.
 */
function useInPageAnchorScroll() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href")?.slice(1);
      if (!id) return;
      // Real route links (e.g. "#/admin", "#/egresado/slug") must go through
      // the router as normal navigation, not be treated as an in-page anchor.
      if (id.startsWith("/")) return;

      e.preventDefault();
      const scrollToTarget = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

      // Si la sección está en esta página, baja hasta ella; si está en otra
      // página (p. ej. "#buscador" vive en ADN Emprendedor), va allá primero.
      if (document.getElementById(id)) {
        scrollToTarget();
        return;
      }
      const destino = rutaDeSeccion(id);
      if (location.pathname !== destino) {
        navigate(destino);
        // espera a que la página nueva termine de entrar (transición) y baja
        let intentos = 0;
        const esperar = () => {
          if (document.getElementById(id) || intentos++ > 30) {
            window.setTimeout(scrollToTarget, 700);
            // segunda pasada por si la página creció al cargar imágenes
            window.setTimeout(scrollToTarget, 1600);
          }
          else window.setTimeout(esperar, 100);
        };
        window.setTimeout(esperar, 150);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [location.pathname, navigate]);
}

function AnimatedRoutes() {
  const location = useLocation();
  useInPageAnchorScroll();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/egresado/:slug"
          element={
            <PageTransition>
              <ProfilePage />
            </PageTransition>
          }
        />
        <Route
          path={RUTAS.adn}
          element={
            <PageTransition>
              <LineaPage pagina="adn" />
            </PageTransition>
          }
        />
        <Route
          path={RUTAS.mundo}
          element={
            <PageTransition>
              <LineaPage pagina="mundo" />
            </PageTransition>
          }
        />
        <Route
          path={RUTAS.inspiran}
          element={
            <PageTransition>
              <LineaPage pagina="inspiran" />
            </PageTransition>
          }
        />
        <Route
          path="/juego"
          element={
            <PageTransition>
              <JuegoPage />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <main className="relative">
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </main>
    );
  }

  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      <main className="relative">
        <AnimatedRoutes />
      </main>
    </>
  );
}
