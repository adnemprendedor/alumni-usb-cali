import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { juego, type JuegoEgresado } from "../data/juego";
import FlipCard from "../components/FlipCard";
import Footer from "../components/Footer";

function mezclar(lista: JuegoEgresado[]): JuegoEgresado[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default function JuegoPage() {
  const [orden, setOrden] = useState(juego);
  const [ronda, setRonda] = useState(0);

  function mezclarTarjetas() {
    setOrden((actual) => {
      let nuevo = mezclar(actual);
      // evita que quede exactamente igual
      if (nuevo.every((p, i) => p.id === actual[i].id)) nuevo = mezclar(actual);
      return nuevo;
    });
    setRonda((r) => r + 1);
  }

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
            Egresados que dejan huella
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 max-w-2xl text-balance text-paper-dim"
          >
            Toca cualquier tarjeta para girarla y descubrir qué estudió cada egresado en la USB, si es empleado o
            emprendedor, en qué empresa está y a qué se dedica. ¿Reconoces a alguno? Mezcla las tarjetas y vuelve a jugar.
          </motion.p>
        </div>
      </section>

      <section className="relative px-4 pb-28 sm:px-8 lg:pb-40">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.2em] text-paper-dim">{orden.length} egresados</p>
            <button
              type="button"
              onClick={mezclarTarjetas}
              data-cursor-hover
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              <span aria-hidden>⇄</span> Mezclar tarjetas
            </button>
          </div>

          <div className="mx-auto grid max-w-sm grid-cols-1 gap-5 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orden.map((persona, i) => (
              <motion.div
                key={persona.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: ronda === 0 ? (i % 10) * 0.04 : 0,
                  layout: { type: "spring", stiffness: 260, damping: 28 },
                }}
              >
                <FlipCard persona={persona} resetSignal={ronda} />
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
