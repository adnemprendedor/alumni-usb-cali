import { useEffect, useState } from "react";

/**
 * Color del borde del logo (promedio de las 4 esquinas). Se usa como fondo de
 * la tarjeta para que el logo, a pantalla completa, se funda con ella sin que
 * se note el recuadro de la imagen.
 */
export function useColorBorde(src: string): string {
  const [color, setColor] = useState("#ffffff");
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const w = c.width - 1;
        const h = c.height - 1;
        const puntos = [
          [1, 1],
          [w - 1, 1],
          [1, h - 1],
          [w - 1, h - 1],
        ];
        let r = 0, g = 0, b = 0;
        for (const [x, y] of puntos) {
          const d = ctx.getImageData(x, y, 1, 1).data;
          r += d[0];
          g += d[1];
          b += d[2];
        }
        setColor(`rgb(${Math.round(r / 4)}, ${Math.round(g / 4)}, ${Math.round(b / 4)})`);
      } catch {
        // si no se puede leer la imagen, queda el fondo blanco
      }
    };
    img.src = src;
  }, [src]);
  return color;
}

