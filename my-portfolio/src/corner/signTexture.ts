import * as THREE from "three";

/* Los letreros se pintan en un canvas con la tipografía del sitio
   (no se carga una fuente aparte para el 3D) y se usan como textura. */

type SignStyle = {
  width: number;
  height: number;
  bg: string;
  ink: string;
  /** Línea principal. */
  title: string;
  /** Línea chica debajo (colonia, sección). */
  subtitle?: string;
  /** Flecha al final del letrero. */
  arrow?: "left" | "right";
  align?: "left" | "center";
  border?: boolean;
};

const PX = 4; // densidad: 4 px de textura por unidad de diseño

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, dir: "left" | "right") {
  const s = dir === "right" ? 1 : -1;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = size * 0.16;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.beginPath();
  ctx.moveTo(-s * size * 0.5, 0);
  ctx.lineTo(s * size * 0.45, 0);
  ctx.moveTo(s * size * 0.05, -size * 0.38);
  ctx.lineTo(s * size * 0.48, 0);
  ctx.lineTo(s * size * 0.05, size * 0.38);
  ctx.stroke();
  ctx.restore();
}

export function makeSignTexture(style: SignStyle, maxAnisotropy = 4) {
  const w = style.width * PX;
  const h = style.height * PX;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = style.bg;
  ctx.fillRect(0, 0, w, h);

  // Filete blanco interior, como en las placas de nomenclatura.
  if (style.border !== false) {
    const inset = h * 0.07;
    ctx.strokeStyle = style.ink;
    ctx.lineWidth = h * 0.035;
    ctx.beginPath();
    ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, h * 0.06);
    ctx.stroke();
  }

  ctx.fillStyle = style.ink;
  ctx.strokeStyle = style.ink;
  ctx.textBaseline = "alphabetic";

  const padX = h * 0.28;
  const arrowSpace = style.arrow ? h * 0.75 : 0;
  const maxTextW = w - padX * 2 - arrowSpace;
  const hasSub = !!style.subtitle;

  let titleSize = h * (hasSub ? 0.4 : 0.5);
  ctx.font = `600 ${titleSize}px Switzer, system-ui, sans-serif`;
  while (ctx.measureText(style.title).width > maxTextW && titleSize > 8) {
    titleSize -= 2;
    ctx.font = `600 ${titleSize}px Switzer, system-ui, sans-serif`;
  }

  const textX =
    style.align === "center"
      ? (w - arrowSpace) / 2 + (style.arrow === "left" ? arrowSpace : 0)
      : padX + (style.arrow === "left" ? arrowSpace : 0);
  ctx.textAlign = style.align === "center" ? "center" : "left";

  const titleY = hasSub ? h * 0.56 : h * 0.5 + titleSize * 0.36;
  ctx.fillText(style.title, textX, titleY);

  if (style.subtitle) {
    ctx.font = `500 ${h * 0.17}px Switzer, system-ui, sans-serif`;
    ctx.fillText(style.subtitle, textX, h * 0.8);
  }

  if (style.arrow === "right") drawArrow(ctx, w - padX - h * 0.22, h / 2, h * 0.42, "right");
  if (style.arrow === "left") drawArrow(ctx, padX + h * 0.22, h / 2, h * 0.42, "left");

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/** Cara del octágono de ALTO: un disco recortado por la geometría. */
export function makeStopTexture(word: string) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#c8102e";
  ctx.fillRect(0, 0, size, size);

  // Filete blanco octagonal.
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = size * 0.035;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    const r = size * 0.43;
    const x = size / 2 + Math.cos(a) * r;
    const y = size / 2 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = `700 ${size * 0.25}px Switzer, system-ui, sans-serif`;
  ctx.fillText(word, size / 2, size / 2 + size * 0.09);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Letrero de neón: tubo claro sobre fondo transparente. El brillo lo pone el bloom. */
export function makeNeonTexture(text: string) {
  const w = 1024;
  const h = 320;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = 190;
  ctx.font = `500 ${size}px Switzer, system-ui, sans-serif`;
  while (ctx.measureText(text).width > w * 0.86 && size > 40) {
    size -= 6;
    ctx.font = `500 ${size}px Switzer, system-ui, sans-serif`;
  }
  // Tubo: trazo redondo grueso y un núcleo más claro.
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = size * 0.1;
  ctx.strokeText(text, w / 2, h / 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, w / 2, h / 2);
  // Marco de tubo alrededor
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect(18, 18, w - 36, h - 36, 60);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
