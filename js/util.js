/* Funciones chicas sin dependencias del mapa ni de la página */
import { RITMO_KMH } from './config.js';

export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esTactil = window.matchMedia('(pointer: coarse)').matches;

/* Opciones de animación de Leaflet, sin animar si la persona pidió menos movimiento */
export const vuelo = segundos => (reduceMotion ? { animate: false } : { duration: segundos });

/* GeoJSON usa [lng, lat]; Leaflet, [lat, lng] */
export const ll = ([lng, lat]) => [lat, lng];

/* Distancia en metros entre dos puntos [lng, lat] */
export function haversine(a, b) {
  const R = 6371008.8, rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad, dLng = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function largoKm(coords) {
  let m = 0;
  for (let i = 1; i < coords.length; i++) m += haversine(coords[i - 1], coords[i]);
  return m / 1000;
}

export const fmtKm = km => km.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' km';

/* Tiempo estimado redondeado a 5 minutos */
export function fmtTiempo(km, dificultad) {
  const total = Math.max(5, Math.round(km / (RITMO_KMH[dificultad] || RITMO_KMH.media) * 60 / 5) * 5);
  const h = Math.floor(total / 60), m = total % 60;
  return h ? `${h} h${m ? ' ' + m + ' min' : ''}` : `${m} min`;
}

export const capital = s => (s ? s[0].toUpperCase() + s.slice(1) : '');

/* ¿El punto [lat, lng] está dentro del anillo [[lat, lng], ...]? (ray casting) */
export function dentroDe(anillo, [lat, lng]) {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [yi, xi] = anillo[i], [yj, xj] = anillo[j];
    if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
