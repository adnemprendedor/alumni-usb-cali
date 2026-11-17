import Footer from "../components/Footer";
import { SECCIONES, seccionesDe } from "./secciones";

/** Inicio: la Red de Graduados Alumni USB Cali. Orden y visibilidad desde el panel. */
export default function HomePage() {
  return (
    <>
      {seccionesDe("inicio").map((s) => {
        const Seccion = SECCIONES[s.id];
        return <Seccion key={s.id} />;
      })}
      <Footer />
    </>
  );
}
