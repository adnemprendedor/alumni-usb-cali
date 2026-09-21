import Hero from "../components/Hero";
import ExploreSection from "../components/ExploreSection";
import FeaturedSection from "../components/FeaturedSection";
import ProductsHorizontal from "../components/ProductsHorizontal";
import CategoriesSection from "../components/CategoriesSection";
import CareersSection from "../components/CareersSection";
import SearchSection from "../components/SearchSection";
import StatsSection from "../components/StatsSection";
import ConectaSection from "../components/ConectaSection";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ExploreSection />
      <FeaturedSection />
      <ProductsHorizontal />
      <CategoriesSection />
      <CareersSection />
      <SearchSection />
      <StatsSection />
      <ConectaSection />
      <Footer />
    </>
  );
}
