/**
 * Hex ↔ HSV conversion. HSV: H 0-360, S 0-100, V 0-100.
 */

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const rgb = hexToRgb(hex);
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

export function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
  const n = parseInt(normalized, 16);
  if (Number.isNaN(n) || normalized.length < 6) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const rr = Math.round(Math.max(0, Math.min(255, r)));
  const gg = Math.round(Math.max(0, Math.min(255, g)));
  const bb = Math.round(Math.max(0, Math.min(255, b)));
  return `#${(rr << 16 | gg << 8 | bb).toString(16).padStart(6, "0")}`;
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : (d / max) * 100;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r:
        h = (60 * ((g - b) / d) + 360) % 360;
        break;
      case g:
        h = 60 * ((b - r) / d) + 120;
        break;
      case b:
        h = 60 * ((r - g) / d) + 240;
        break;
    }
  }
  return { h: Math.round(h), s: Math.round(s), v: Math.round(v * 100) };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h = h % 360;
  if (h < 0) h += 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  v = Math.max(0, Math.min(100, v)) / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  };
}
