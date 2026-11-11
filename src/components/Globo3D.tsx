import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CATEGORIAS, categoriaPunto, exterior, type PuntoMapa } from "../data/exterior";

/**
 * Globo terráqueo 3D (WebGL / three.js) con los egresados en el exterior.
 *
 * - Texturas NASA en 4K (2K en celular): día, luces nocturnas, relieve,
 *   brillo del océano y nubes. Sombreado propio día/noche con atmósfera.
 * - Arcos animados desde Cali hasta cada ciudad, con un pulso de luz que viaja.
 * - Arrastrar para girar (con inercia), botones de zoom, clic/toque en un
 *   punto para verlo; el globo gira solo hasta dejarlo al frente.
 * - Rendimiento: se dibuja a la frecuencia de la pantalla (60/120/144/180 Hz),
 *   se pausa fuera de pantalla o con la pestaña oculta, limita la resolución
 *   interna y la baja sola si el equipo no da abasto.
 */

const RAD = Math.PI / 180;
const BASE = import.meta.env.BASE_URL;

/** lat/lng → punto sobre la esfera (mismo mapeo UV que SphereGeometry). */
function aVector(lat: number, lng: number, r = 1) {
  const phi = (90 - lat) * RAD;
  const a = (lng + 180) * RAD;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(a), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(a));
}

/** Rotación del globo (orden XYZ) que deja lat/lng mirando a la cámara. */
function rotacionPara(lat: number, lng: number) {
  const v = aVector(lat, lng);
  return { y: -Math.atan2(v.x, v.z), x: lat * RAD };
}

const vertTierra = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const fragTierra = /* glsl */ `
  uniform sampler2D uDia;
  uniform sampler2D uNoche;
  uniform sampler2D uRelieve;   // R: relieve · G: rugosidad (océano liso) · B: nubes
  uniform vec3 uSol;
  uniform vec3 uAtm;
  uniform vec2 uTexel;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vPos);

    // relieve: perturba la normal con el gradiente del mapa de alturas
    float h  = texture2D(uRelieve, vUv).r;
    float hx = texture2D(uRelieve, vUv + vec2(uTexel.x, 0.0)).r;
    float hy = texture2D(uRelieve, vUv + vec2(0.0, uTexel.y)).r;
    vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), N) + 1e-4);
    vec3 B = normalize(cross(N, T));
    vec3 Nb = normalize(N - (T * (hx - h) + B * (hy - h)) * 6.0);

    float ndl = dot(Nb, uSol);
    float dia = smoothstep(-0.18, 0.35, dot(N, uSol));

    vec3 colDia = texture2D(uDia, vUv).rgb;
    colDia *= 0.22 + 0.95 * max(ndl, 0.0);

    vec3 luces = texture2D(uNoche, vUv).rgb;
    luces = pow(luces, vec3(1.6)) * vec3(1.6, 1.15, 0.7) * 1.8;

    vec3 col = mix(luces + colDia * 0.06, colDia, dia);

    // brillo especular del océano
    float rug = texture2D(uRelieve, vUv).g;
    vec3 R = reflect(-uSol, N);
    float spec = pow(max(dot(R, V), 0.0), 38.0) * (1.0 - rug) * dia;
    col += vec3(0.75, 0.82, 1.0) * spec * 0.55;

    // sombra suave de las nubes sobre el suelo
    float nube = texture2D(uRelieve, vUv + vec2(0.0015, 0.0)).b;
    col *= 1.0 - nube * 0.28 * dia;

    // borde atmosférico (fresnel)
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    col += uAtm * fres * (0.25 + 0.9 * dia);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const fragNubes = /* glsl */ `
  uniform sampler2D uRelieve;
  uniform vec3 uSol;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    float a = texture2D(uRelieve, vUv).b;
    a = smoothstep(0.12, 0.9, a);
    vec3 N = normalize(vNormal);
    float luz = clamp(dot(N, uSol) * 1.1 + 0.15, 0.0, 1.0);
    vec3 V = normalize(cameraPosition - vPos);
    float borde = smoothstep(0.0, 0.35, dot(N, V));
    gl_FragColor = vec4(vec3(1.0) * (0.2 + 0.85 * luz), a * 0.85 * borde);
  }
`;

const vertAtm = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const fragAtm = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColor2;
  varying vec3 vNormal;
  varying vec3 vPos;
  void main() {
    vec3 V = normalize(cameraPosition - vPos);
    float i = pow(clamp(0.72 + dot(vNormal, V), 0.0, 1.0), 4.0);
    vec3 c = mix(uColor2, uColor, clamp(vNormal.y * 0.5 + 0.6, 0.0, 1.0));
    gl_FragColor = vec4(c, i * 0.9);
  }
`;

const vertArco = /* glsl */ `
  varying float vT;
  void main() {
    vT = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragArco = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTiempo;
  uniform float uDesfase;
  uniform float uDibujo;
  uniform float uFuerza;
  varying float vT;
  void main() {
    if (vT > uDibujo) discard;
    float p = fract(uTiempo * 0.32 + uDesfase);
    float d = vT - p;
    float cola = exp(-d * d * 900.0) + smoothstep(-0.22, 0.0, d) * step(d, 0.0) * 0.55;
    float bordes = smoothstep(0.0, 0.06, vT) * smoothstep(1.0, 0.94, vT);
    float a = (0.34 + cola * 1.5) * bordes * uFuerza;
    gl_FragColor = vec4(uColor * (1.0 + cola * 1.2), a);
  }
`;

/** Textura radial para los brillos (canvas, sin archivos). */
function texturaBrillo() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.18, "rgba(255,255,255,0.85)");
  r.addColorStop(0.45, "rgba(255,255,255,0.22)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export interface Globo3DProps {
  puntos: PuntoMapa[];
  seleccion: string | null;
  onSeleccion: (clave: string | null) => void;
  /** Se llama si el navegador no soporta WebGL. */
  onSinWebGL?: () => void;
  className?: string;
}

export default function Globo3D({ puntos, seleccion, onSeleccion, onSinWebGL, className = "" }: Globo3DProps) {
  const contRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ enfocar: (clave: string | null) => void; zoom: (d: number) => void } | null>(null);
  const selRef = useRef<string | null>(seleccion);
  const onSelRef = useRef(onSeleccion);
  onSelRef.current = onSeleccion;
  const [cargado, setCargado] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    const cont = contRef.current;
    if (!cont) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tactil = window.matchMedia("(pointer: coarse)").matches;
    const grande = Math.min(screen.width, screen.height) * (window.devicePixelRatio || 1) >= 1400 && !tactil;
    const res = grande ? "4k" : "2k";

    // ── renderer ───────────────────────────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      onSinWebGL?.();
      return;
    }
    const maxDpr = tactil ? 1.75 : 2;
    let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "block h-full w-full";
    renderer.domElement.setAttribute("aria-hidden", "true");
    cont.appendChild(renderer.domElement);

    const escena = new THREE.Scene();
    const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    let zoomObjetivo = 5;
    camara.position.set(0, 0, zoomObjetivo);

    const sol = new THREE.Vector3(-0.55, 0.42, 1).normalize();
    const globo = new THREE.Group();
    escena.add(globo);

    // ── texturas ───────────────────────────────────────────────
    const loader = new THREE.TextureLoader();
    const aniso = renderer.capabilities.getMaxAnisotropy();
    const cargar = (n: string, srgb: boolean) =>
      new Promise<THREE.Texture>((ok, mal) =>
        loader.load(
          `${BASE}globo/${n}-${res}.jpg`,
          (t) => {
            t.anisotropy = aniso;
            if (srgb) t.colorSpace = THREE.SRGBColorSpace;
            ok(t);
          },
          undefined,
          mal
        )
      );

    const uTierra = {
      uDia: { value: null as THREE.Texture | null },
      uNoche: { value: null as THREE.Texture | null },
      uRelieve: { value: null as THREE.Texture | null },
      uSol: { value: sol },
      uAtm: { value: new THREE.Color("#6f8dff") },
      uTexel: { value: new THREE.Vector2(1 / (res === "4k" ? 4096 : 2048), 1 / (res === "4k" ? 2048 : 1024)) },
    };
    const geoEsfera = new THREE.SphereGeometry(1, tactil ? 96 : 160, tactil ? 64 : 112);
    const matTierra = new THREE.ShaderMaterial({ uniforms: uTierra, vertexShader: vertTierra, fragmentShader: fragTierra });
    const tierra = new THREE.Mesh(geoEsfera, matTierra);
    tierra.visible = false;
    globo.add(tierra);

    const matNubes = new THREE.ShaderMaterial({
      uniforms: { uRelieve: uTierra.uRelieve, uSol: uTierra.uSol },
      vertexShader: vertTierra,
      fragmentShader: fragNubes,
      transparent: true,
      depthWrite: false,
    });
    const nubes = new THREE.Mesh(geoEsfera, matNubes);
    nubes.scale.setScalar(1.012);
    nubes.visible = false;
    globo.add(nubes);

    const atm = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 48),
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#7ea2ff") }, uColor2: { value: new THREE.Color("#9b6bff") } },
        vertexShader: vertAtm,
        fragmentShader: fragAtm,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    atm.scale.setScalar(1.16);
    escena.add(atm);

    let vivo = true;
    Promise.all([cargar("dia", true), cargar("noche", true), cargar("relieve-nubes", false)])
      .then(([d, n, r]) => {
        if (!vivo) return [d, n, r].forEach((t) => t.dispose());
        uTierra.uDia.value = d;
        uTierra.uNoche.value = n;
        uTierra.uRelieve.value = r;
        tierra.visible = nubes.visible = true;
        setCargado(true);
      })
      .catch(() => setCargado(true));

    // ── estrellas y órbitas decorativas ────────────────────────
    const nEst = tactil ? 900 : 1800;
    const pos = new Float32Array(nEst * 3);
    for (let i = 0; i < nEst; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(30 + Math.random() * 30);
      pos.set([v.x, v.y, v.z], i * 3);
    }
    const geoEst = new THREE.BufferGeometry();
    geoEst.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const estrellas = new THREE.Points(
      geoEst,
      new THREE.PointsMaterial({ size: 1.4, sizeAttenuation: false, color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })
    );
    escena.add(estrellas);

    const orbitas: THREE.Line[] = [];
    [
      { r: 1.55, c: "#f57206", rx: 1.15, rz: 0.35, o: 0.35 },
      { r: 1.75, c: "#8f96ff", rx: 1.3, rz: -0.5, o: 0.22 },
    ].forEach(({ r, c, rx, rz, o }) => {
      const pts = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2).getPoints(160);
      const l = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false })
      );
      l.rotation.set(rx, 0, rz);
      escena.add(l);
      orbitas.push(l);
    });

    // ── puntos y arcos ─────────────────────────────────────────
    const brillo = texturaBrillo();
    const origen = aVector(exterior.origen.lat, exterior.origen.lng);
    const objetos: {
      clave: string;
      punto: THREE.Mesh;
      halo: THREE.Sprite;
      anillo: THREE.Mesh;
      hit: THREE.Mesh;
      arco: THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial>;
      lugar: string;
      total: number;
      base: THREE.Vector3;
    }[] = [];

    const caliHalo = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: brillo, color: "#ff8a1f", blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })
    );
    caliHalo.position.copy(origen.clone().multiplyScalar(1.01));
    caliHalo.scale.setScalar(0.16);
    globo.add(caliHalo);
    const caliPunto = new THREE.Mesh(new THREE.SphereGeometry(0.013, 16, 12), new THREE.MeshBasicMaterial({ color: "#ffd2a6" }));
    caliPunto.position.copy(origen.clone().multiplyScalar(1.004));
    globo.add(caliPunto);

    const geoPunto = new THREE.SphereGeometry(0.011, 16, 12);
    const geoAnillo = new THREE.RingGeometry(0.018, 0.024, 40);
    const geoHit = new THREE.SphereGeometry(0.06, 8, 6);

    puntos.forEach((p, i) => {
      const col = new THREE.Color(CATEGORIAS[categoriaPunto(p)].color);
      const fin = aVector(p.lat, p.lng);
      const dist = origen.distanceTo(fin);
      const alto = 1 + 0.12 + dist * 0.22;
      const c1 = origen.clone().lerp(fin, 0.25).normalize().multiplyScalar(alto);
      const c2 = origen.clone().lerp(fin, 0.75).normalize().multiplyScalar(alto);
      const curva = new THREE.CubicBezierCurve3(origen.clone().multiplyScalar(1.003), c1, c2, fin.clone().multiplyScalar(1.003));
      const arco = new THREE.Mesh(
        new THREE.TubeGeometry(curva, 96, 0.0048, 6, false),
        new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: col },
            uTiempo: { value: 0 },
            uDesfase: { value: i * 0.17 },
            uDibujo: { value: reduce ? 1 : 0 },
            uFuerza: { value: 1 },
          },
          vertexShader: vertArco,
          fragmentShader: fragArco,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      globo.add(arco);

      const punto = new THREE.Mesh(geoPunto, new THREE.MeshBasicMaterial({ color: col.clone().lerp(new THREE.Color("#fff"), 0.45) }));
      punto.position.copy(fin.clone().multiplyScalar(1.004));
      globo.add(punto);

      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: brillo, color: col, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })
      );
      halo.position.copy(fin.clone().multiplyScalar(1.01));
      halo.scale.setScalar(0.1);
      globo.add(halo);

      const anillo = new THREE.Mesh(
        geoAnillo,
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false })
      );
      anillo.position.copy(fin.clone().multiplyScalar(1.006));
      anillo.lookAt(fin.clone().multiplyScalar(2));
      globo.add(anillo);

      const hit = new THREE.Mesh(geoHit, new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.copy(fin);
      hit.userData.clave = p.clave;
      globo.add(hit);

      objetos.push({ clave: p.clave, punto, halo, anillo, hit, arco, lugar: p.lugar, total: p.personas.length, base: fin });
    });

    // ── estado de rotación ─────────────────────────────────────
    const ini = rotacionPara(18, -40); // de entrada: América y Europa a la vista
    const rot = { x: ini.x, y: ini.y - 0.9 }; // arranca girado y "llega" a su sitio
    const obj = { x: ini.x, y: ini.y };
    const vel = { x: 0, y: 0 };
    let ultimaInteraccion = -1e9;
    globo.rotation.order = "XYZ";

    const enfocar = (clave: string | null) => {
      if (!clave) return;
      const p = puntos.find((q) => q.clave === clave);
      if (!p) return;
      const r = rotacionPara(p.lat * 0.75, p.lng);
      // camino más corto en Y
      let dy = r.y - rot.y;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      obj.y = rot.y + dy;
      obj.x = Math.max(-1.1, Math.min(1.1, r.x));
      vel.x = vel.y = 0;
      zoomObjetivo = Math.min(zoomObjetivo, 4.4);
    };
    apiRef.current = {
      enfocar,
      zoom: (d) => {
        zoomObjetivo = Math.max(3.4, Math.min(6.2, zoomObjetivo + d));
        ultimaInteraccion = performance.now();
      },
    };

    // ── interacción ────────────────────────────────────────────
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hits = objetos.map((o) => o.hit);
    let arrastre: { x: number; y: number; px: number; py: number; t: number; movio: boolean } | null = null;
    let hover: string | null = null;
    let ultimoPuntero: { x: number; y: number } | null = null;

    const tocar = (cx: number, cy: number) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camara);
      const h = ray.intersectObjects(hits, false)[0];
      if (!h) return null;
      // ignorar puntos que quedaron detrás del planeta
      const t = ray.intersectObject(tierra, false)[0];
      if (t && t.distance < h.distance - 0.03) return null;
      return h.object.userData.clave as string;
    };

    const el = renderer.domElement;
    const down = (e: PointerEvent) => {
      arrastre = { x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, t: performance.now(), movio: false };
      el.setPointerCapture(e.pointerId);
      vel.x = vel.y = 0;
      ultimaInteraccion = performance.now();
    };
    const move = (e: PointerEvent) => {
      ultimoPuntero = { x: e.clientX, y: e.clientY };
      if (!arrastre) return;
      const dx = e.clientX - arrastre.px;
      const dy = e.clientY - arrastre.py;
      if (Math.abs(e.clientX - arrastre.x) + Math.abs(e.clientY - arrastre.y) > 6) {
        if (!arrastre.movio) setArrastrando(true);
        arrastre.movio = true;
      }
      const k = 0.0045 * (zoomObjetivo / 5);
      obj.y += dx * k;
      obj.x = Math.max(-1.1, Math.min(1.1, obj.x + dy * k));
      vel.y = dx * k;
      vel.x = dy * k;
      arrastre.px = e.clientX;
      arrastre.py = e.clientY;
      ultimaInteraccion = performance.now();
    };
    const up = (e: PointerEvent) => {
      if (!arrastre) return;
      if (!arrastre.movio) {
        const c = tocar(e.clientX, e.clientY);
        if (c) onSelRef.current(c === selRef.current ? null : c);
      }
      arrastre = null;
      setArrastrando(false);
      ultimaInteraccion = performance.now();
    };
    const leave = () => {
      ultimoPuntero = null;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", leave);
    el.style.touchAction = "pan-y";

    // ── tamaño ─────────────────────────────────────────────────
    const ajustar = () => {
      const w = cont.clientWidth;
      const h = cont.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camara.aspect = w / h;
      camara.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(ajustar);
    ro.observe(cont);
    ajustar();

    // ── bucle ──────────────────────────────────────────────────
    const reloj = new THREE.Clock();
    let tiempo = 0;
    let dibujo = reduce ? 1 : 0;
    let lento = 0;
    let muestras = 0;
    const proy = new THREE.Vector3();
    const tmp = new THREE.Vector3();

    const cuadro = () => {
      const dt = Math.min(reloj.getDelta(), 0.05);
      if (!reduce) tiempo += dt;
      const ahora = performance.now();

      // autogiro cuando nadie está interactuando
      if (!reduce && !arrastre && !selRef.current && ahora - ultimaInteraccion > 2500) obj.y += dt * 0.07;
      // inercia
      if (!arrastre && (Math.abs(vel.x) > 1e-5 || Math.abs(vel.y) > 1e-5)) {
        obj.y += vel.y;
        obj.x = Math.max(-1.1, Math.min(1.1, obj.x + vel.x));
        const f = Math.exp(-dt * 4.5);
        vel.x *= f;
        vel.y *= f;
      }
      const s = 1 - Math.exp(-dt * (arrastre ? 18 : 4.2));
      rot.x += (obj.x - rot.x) * s;
      rot.y += (obj.y - rot.y) * s;
      globo.rotation.set(rot.x, rot.y, 0);
      nubes.rotation.y = tiempo * 0.012;
      camara.position.z += (zoomObjetivo - camara.position.z) * (1 - Math.exp(-dt * 5));
      orbitas[0].rotation.z += dt * 0.05;
      orbitas[1].rotation.z -= dt * 0.035;
      estrellas.rotation.y = rot.y * 0.08;

      if (dibujo < 1) dibujo = Math.min(1, dibujo + dt * 0.55);

      const sel = selRef.current;
      for (let i = 0; i < objetos.length; i++) {
        const o = objetos[i];
        const activo = sel === o.clave || hover === o.clave;
        const u = o.arco.material.uniforms;
        u.uTiempo.value = tiempo;
        u.uDibujo.value = Math.min(1, Math.max(0, dibujo * 1.6 - i * 0.05));
        const fz = sel ? (sel === o.clave ? 1.8 : 0.35) : 1;
        u.uFuerza.value += (fz - u.uFuerza.value) * s;
        const pulso = reduce ? 0.4 : (tiempo * 0.7 + i * 0.13) % 1;
        o.anillo.scale.setScalar(1 + pulso * 2.4 * (activo ? 1.3 : 1));
        (o.anillo.material as THREE.MeshBasicMaterial).opacity = (1 - pulso) * 0.85;
        const esc = activo ? 1.8 : 1;
        o.punto.scale.setScalar(o.punto.scale.x + (esc - o.punto.scale.x) * s);
        o.halo.scale.setScalar(0.1 * (activo ? 1.9 : 1) * (1 + Math.sin(tiempo * 2.2 + i) * 0.12));
      }
      caliHalo.scale.setScalar(0.17 * (1 + Math.sin(tiempo * 2) * 0.15));

      // hover (una vez por cuadro)
      let nuevoHover: string | null = null;
      if (ultimoPuntero && !arrastre && !tactil) nuevoHover = tocar(ultimoPuntero.x, ultimoPuntero.y);
      if (nuevoHover !== hover) {
        hover = nuevoHover;
        el.style.cursor = hover ? "pointer" : "grab";
      }

      // etiqueta flotante del punto con hover o seleccionado
      const tip = tipRef.current;
      const etiqueta = hover ?? sel;
      const o = etiqueta ? objetos.find((x) => x.clave === etiqueta) : null;
      if (tip) {
        if (o) {
          o.hit.getWorldPosition(proy);
          // visible si el punto mira hacia la cámara (no está detrás del planeta)
          const deFrente = tmp.copy(camara.position).sub(proy).normalize().dot(proy.clone().normalize()) > 0.12;
          proy.project(camara);
          const r = el.getBoundingClientRect();
          const x = (proy.x * 0.5 + 0.5) * r.width;
          const y = (-proy.y * 0.5 + 0.5) * r.height;
          tip.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -135%)`;
          tip.style.opacity = deFrente ? "1" : "0";
          const txt = `${o.lugar} · ${o.total} ${o.total === 1 ? "egresado" : "egresados"}`;
          if (tip.textContent !== txt) tip.textContent = txt;
        } else tip.style.opacity = "0";
      }

      renderer.render(escena, camara);

      // calidad adaptable: si va lento de forma sostenida, baja la resolución interna
      lento = lento * 0.95 + (dt > 1 / 45 ? 1 : 0) * 0.05;
      if (++muestras > 120 && lento > 0.6 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.25);
        renderer.setPixelRatio(dpr);
        ajustar();
        muestras = 0;
        lento = 0;
      }
    };

    // ── pausar fuera de pantalla / pestaña oculta ──────────────
    let enPantalla = false;
    const actualizarBucle = () => {
      const correr = enPantalla && !document.hidden;
      renderer.setAnimationLoop(correr ? cuadro : null);
      if (correr) reloj.getDelta();
    };
    const io = new IntersectionObserver(([en]) => {
      enPantalla = en.isIntersecting;
      actualizarBucle();
    }, { rootMargin: "100px" });
    io.observe(cont);
    document.addEventListener("visibilitychange", actualizarBucle);

    return () => {
      vivo = false;
      renderer.setAnimationLoop(null);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", actualizarBucle);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerleave", leave);
      escena.traverse((n) => {
        const m = n as THREE.Mesh;
        m.geometry?.dispose?.();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mt) => mt.dispose());
      });
      [uTierra.uDia.value, uTierra.uNoche.value, uTierra.uRelieve.value, brillo].forEach((t) => t?.dispose());
      renderer.dispose();
      el.remove();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puntos]);

  useEffect(() => {
    selRef.current = seleccion;
    apiRef.current?.enfocar(seleccion);
  }, [seleccion]);

  return (
    <div className={`relative ${className}`}>
      {/* el lienzo es más grande que la caja para que la atmósfera y las órbitas
          se desvanezcan sin cortes rectos */}
      <div
        ref={contRef}
        style={{
          maskImage: "radial-gradient(circle at 50% 50%, #000 52%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 52%, transparent 70%)",
        }}
        className={`absolute -inset-[14%] transition-opacity duration-1000 ${cargado ? "opacity-100" : "opacity-0"} ${arrastrando ? "cursor-grabbing" : "cursor-grab"}`}
      />
      {!cargado && (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <div className="h-[62%] w-[62%] animate-pulse rounded-full bg-[radial-gradient(circle_at_35%_30%,#3b4a8f,#14182e_70%)] shadow-[0_0_80px_rgba(111,141,255,0.35)]" />
        </div>
      )}
      <div
        ref={tipRef}
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full border border-white/15 bg-ink/85 px-3 py-1.5 text-xs font-medium text-paper opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-200"
        aria-hidden
      />
      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
        {[
          { l: "Acercar", s: "+", d: -0.5 },
          { l: "Alejar", s: "−", d: 0.5 },
        ].map((b) => (
          <button
            key={b.l}
            type="button"
            aria-label={b.l}
            onClick={() => apiRef.current?.zoom(b.d)}
            data-cursor-hover
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink/70 text-lg text-paper backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold"
          >
            {b.s}
          </button>
        ))}
      </div>
    </div>
  );
}
