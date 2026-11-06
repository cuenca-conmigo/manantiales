/* Funciones chicas sin dependencias del mapa ni de la página */

export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esTactil = window.matchMedia('(pointer: coarse)').matches;

/* Opciones de animación de Leaflet, sin animar si la persona pidió menos movimiento */
export const vuelo = segundos => (reduceMotion ? { animate: false } : { duration: segundos });

/* GeoJSON usa [lng, lat]; Leaflet, [lat, lng] */
export const ll = ([lng, lat]) => [lat, lng];
