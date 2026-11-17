import type { ComponentType } from "react";
import MundoSection from "../components/MundoSection";
import Hero from "../components/Hero";
import FeaturedPickSection from "../components/FeaturedPickSection";
import CategoriesSection from "../components/CategoriesSection";
import SearchSection from "../components/SearchSection";
import ProductsHorizontal from "../components/ProductsHorizontal";
import FeaturedSection from "../components/FeaturedSection";
import VideoStoriesSection from "../components/VideoStoriesSection";
import StatsSection from "../components/StatsSection";
import ConectaSection from "../components/ConectaSection";
import ContactoSection from "../components/ContactoSection";
import {
  ConectaRedSection,
  HistoriasSection,
  LineasSection,
  NovedadesSection,
  OportunidadesSection,
  ParticipaSection,
  RedHero,
} from "../components/RedAlumni";
import { RUTAS, sitio, type PaginaId } from "../data/sitio";

/** Cada sección del sitio, por el id que usa el panel de administración. */
export const SECCIONES: Record<string, ComponentType> = {
  // inicio: la Red Alumni
  "red-hero": RedHero,
  explora: LineasSection,
  participa: ParticipaSection,
  historias: HistoriasSection,
  oportunidades: OportunidadesSection,
  novedades: NovedadesSection,
  "conecta-red": ConectaRedSection,
  contacto: ContactoSection,
  // línea ADN Emprendedor
  hero: Hero,
  "destacado-semana": FeaturedPickSection,
  categorias: CategoriesSection,
  buscador: SearchSection,
  emprendimientos: ProductsHorizontal,
  estadisticas: StatsSection,
  conecta: ConectaSection,
  // línea Egresados por el mundo
  mundo: MundoSection,
  // línea Egresados que inspiran
  destacados: FeaturedSection,
  videos: VideoStoriesSection,
};

export const paginaDe = (id: string): PaginaId => sitio.secciones.find((s) => s.id === id)?.pagina ?? "inicio";

/** Secciones visibles de una página, en el orden del panel. */
export const seccionesDe = (pagina: PaginaId) =>
  sitio.secciones.filter((s) => (s.pagina ?? "inicio") === pagina && s.visible && SECCIONES[s.id]);

/** Ruta donde vive una sección (para los enlaces "#id" desde otra página). */
export const rutaDeSeccion = (id: string) => RUTAS[paginaDe(id)];
