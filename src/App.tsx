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

      if (location.pathname !== "/") {
        navigate("/");
        window.setTimeout(scrollToTarget, 120);
      } else {
        scrollToTarget();
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
