import Hero from "../components/Hero";
import ExploreSection from "../components/ExploreSection";
import FeaturedPickSection from "../components/FeaturedPickSection";
import CategoriesSection from "../components/CategoriesSection";
import SearchSection from "../components/SearchSection";
import ProductsHorizontal from "../components/ProductsHorizontal";
import FeaturedSection from "../components/FeaturedSection";
import CareersSection from "../components/CareersSection";
import StatsSection from "../components/StatsSection";
import ConectaSection from "../components/ConectaSection";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ExploreSection />
      <FeaturedPickSection />
      <CategoriesSection />
      <SearchSection />
      <ProductsHorizontal />
      <FeaturedSection />
      <CareersSection />
      <StatsSection />
      <ConectaSection />
      <Footer />
    </>
  );
}
