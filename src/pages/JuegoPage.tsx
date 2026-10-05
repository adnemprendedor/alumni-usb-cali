import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { juego } from "../data/juego";
import FlipCard from "../components/FlipCard";
import Footer from "../components/Footer";

export default function JuegoPage() {
  return (
    <div className="bg-ink pt-32 sm:pt-40">
      <section className="relative px-4 pb-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            data-cursor-hover
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-paper-dim hover:text-gold"
          >
            ← Volver al directorio
          </Link>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-3 text-xs uppercase tracking-[0.3em] text-gold"
          >
            Juego · Conoce a nuestros egresados
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="font-display text-balance text-4xl font-light text-paper sm:text-5xl lg:text-6xl"
          >
            ¿Empleado, empresario o emprendedor?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 max-w-2xl text-balance text-paper-dim"
          >
            Toca cualquier tarjeta para girarla y descubrir la historia de cada egresado: si es empleado, empresario o
            emprendedor, y los datos de su trayectoria.
          </motion.p>
        </div>
      </section>

      <section className="relative px-4 pb-28 sm:px-8 lg:pb-40">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {juego.map((persona, i) => (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: (i % 10) * 0.04 }}
              >
                <FlipCard persona={persona} />
              </motion.div>
            ))}
          </div>

          <p className="mt-12 max-w-2xl text-xs text-paper-dim">
            Estas 20 tarjetas son un ejemplo de relleno mientras se recopilan las fotos y los datos reales de los
            egresados. Se actualizarán con la información definitiva más adelante, siguiendo el mismo formato.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
