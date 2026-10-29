import type { ComponentType } from "react";
import Hero from "../components/Hero";
import ExploreSection from "../components/ExploreSection";
import FeaturedPickSection from "../components/FeaturedPickSection";
import CategoriesSection from "../components/CategoriesSection";
import SearchSection from "../components/SearchSection";
import ProductsHorizontal from "../components/ProductsHorizontal";
import FeaturedSection from "../components/FeaturedSection";
import VideoStoriesSection from "../components/VideoStoriesSection";
import StatsSection from "../components/StatsSection";
import ConectaSection from "../components/ConectaSection";
import ContactoSection from "../components/ContactoSection";
import Footer from "../components/Footer";
import { sitio } from "../data/sitio";

/** Cada sección de la página de inicio, por el id que usa el panel de administración. */
const SECCIONES: Record<string, ComponentType> = {
  hero: Hero,
  explora: ExploreSection,
  "destacado-semana": FeaturedPickSection,
  categorias: CategoriesSection,
  buscador: SearchSection,
  emprendimientos: ProductsHorizontal,
  destacados: FeaturedSection,
  videos: VideoStoriesSection,
  estadisticas: StatsSection,
  conecta: ConectaSection,
  contacto: ContactoSection,
};

export default function HomePage() {
  // El orden y cuáles se muestran se configuran en el panel (sitio.json).
  const visibles = sitio.secciones.filter((s) => s.visible && SECCIONES[s.id]);
  return (
    <>
      {visibles.map((s) => {
        const Seccion = SECCIONES[s.id];
        return <Seccion key={s.id} />;
      })}
      <Footer />
    </>
  );
}
