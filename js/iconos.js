/* Íconos de pictografía: figura color hueso sobre una piedra irregular; la piedra lleva el color de la categoría.
   Cada trazo (d) se dibuja como línea, salvo que su índice esté en:
   rellenos (figura rellena), huecos (relleno en el color de la piedra) o tallados (línea en el color de la piedra).
   Para sumar un tipo de lugar nuevo: agregarlo acá y en ETIQUETAS, y usar ese nombre como "subtipo" en el GeoJSON. */

const ICONOS = {
  'mirador': { color: 'verde', rellenos: [0], puntoTallado: true, puntos: [[24.3, 16.8, 2.3]], d: [
    'M14.5 17 C18 12.2 21.5 10.8 24.5 11 C28 11.2 31 13 34 17 C31 20.8 28 22.4 24.3 22.3 C20.6 22.2 17.5 20.6 14.5 17 Z',
    'M12.5 35 L19.5 27.6 L23.5 31.2 L29 26.4 L35.5 35'] },
  'cueva': { color: 'verde', rellenos: [0], huecos: [1], d: [
    'M9.5 35.5 C11 24 17 14.5 24.5 14 C32 13.6 37.5 23 38.5 35.5 Z',
    'M18.6 35 C18.9 29 21 25.6 24.2 25.5 C27.4 25.4 29.4 29 29.6 35 Z'] },
  'info': { color: 'agua', puntos: [[24.2, 14.4, 2.4]], d: [
    'M21 21.6 C22.2 21.4 23.3 21.4 24.3 21.8 C24.1 26.2 24.2 30.6 24 35', 'M20 35.6 C22.8 35.1 25.4 35.1 28.2 35.6'] },
  'guardaparques': { color: 'verde', rellenos: [0], huecos: [1], d: [
    'M11.5 24.5 L24 13.2 L36.5 24.5 V36 H11.5 Z',
    'M20.8 36 V28.6 C20.8 27.6 21.5 27 22.4 27 H25.6 C26.5 27 27.2 27.6 27.2 28.6 V36 Z'] },
  'reserva': { color: 'verde', rellenos: [0], d: [
    'M15.6 22.6 C12.8 17.4 16.6 11.6 22 12.1 C25.1 8.7 31.4 9.7 32.9 14.6 C36.9 16.6 36.4 22.9 32 24.4 C30 27.9 24.6 28.4 22.1 26.4 C18.6 27.4 15 25.9 15.6 22.6 Z',
    'M24.6 26.6 C24.1 30 24.3 33.2 23.6 36.6',
    'M17.6 37.4 C21 36.6 27 36.6 30.6 37.4'] },

  /* Relevamiento de patrimonio. Color de la piedra por categoría:
     tierra = patrimonio rural, roca = arqueológico, verde = paisajístico/natural/simbólico, ocre = vía histórica */
  'puesto': { color: 'tierra', rellenos: [0], d: [
    'M9.5 24 L24 12.5 L38.5 24 Z', 'M13 24 V36 H35 V24', 'M21 36 V29.5 H27 V36'] },
  'banadero': { color: 'tierra', rellenos: [0], tallados: [1], d: [
    'M9.5 22.5 H38.5 L35 34.5 H13 Z',
    'M14.5 27.5 C17.5 25.5 19.5 29.5 22.5 27.5 S27.5 25.5 30.5 27.5 S33.5 29.5 34 27.5', 'M15 34.5 V38 M33 34.5 V38'] },
  'toma-agua': { color: 'tierra', rellenos: [2], d: [
    'M9.5 19 H25.5 C29.5 19 31.5 21 31.5 25 V27', 'M17.5 19 V13.5 M13.5 13.5 H21.5',
    'M31.5 30.5 C30 33 29 34.5 29 36 C29 37.5 30.1 38.5 31.5 38.5 C32.9 38.5 34 37.5 34 36 C34 34.5 33 33 31.5 30.5 Z'] },
  'vado': { color: 'tierra', puntos: [[15, 21.5, 3.4], [24, 19.5, 3.4], [33, 21.5, 3.4]], d: [
    'M9 30.5 C12 28.5 14 32.5 17 30.5 S22 28.5 25 30.5 S30 32.5 33 30.5 S37 28.5 39 30.5',
    'M11 36.5 C14 34.5 16 38.5 19 36.5 S24 34.5 27 36.5 S32 38.5 35 36.5'] },
  'pirca': { color: 'roca', puntos: [[13.5, 32.5, 4], [22, 32.5, 4], [30.5, 32.5, 4], [17.8, 25, 4], [26.3, 25, 4], [34.5, 25.5, 3.6], [22, 17.6, 3.8], [30.2, 18, 3.4]], d: [
    'M9 37.6 H39'] },
  'mortero': { color: 'roca', rellenos: [0], puntoTallado: true, puntos: [[18.5, 29.5, 3], [28.5, 30, 3.4]], d: [
    'M8.5 31 C9.5 25 16 22.5 24 22.5 C32.5 22.5 39.5 25 39.5 31.5 C39.5 35.5 33.5 37.5 24 37.5 C14.5 37.5 8.5 35.5 8.5 31 Z',
    'M33.5 9.5 L29.5 20.5'] },
  'naciente': { color: 'verde', rellenos: [0], d: [
    'M24 9 C21 14 18 17.5 18 21.5 C18 25 20.7 27.5 24 27.5 C27.3 27.5 30 25 30 21.5 C30 17.5 27 14 24 9 Z',
    'M12 32.5 C17 29.5 31 29.5 36 32.5', 'M16 37.5 C20 35.5 28 35.5 32 37.5'] },
  'plaza': { color: 'verde', puntos: [[17, 17, 6.5]], d: [
    'M17 23 V37', 'M24 24.5 H38', 'M24 28.5 H38', 'M25.5 28.5 V36', 'M36.5 28.5 V36'] },
  'cerro': { color: 'verde', rellenos: [0], d: [
    'M8 37 L21 18.5 L27 25.5 L31 20.5 L40 37 Z', 'M21 8.5 V16.5', 'M17.5 11.5 H24.5'] },
  'piedra': { color: 'verde', rellenos: [0], tallados: [1], puntos: [[39.3, 26.8, 2.5]], d: [
    'M11.5 30.5 C11.5 22.5 17.5 17 25 17 C32.5 17 37.5 22.5 37.5 30.5 Z',
    'M18.5 30.5 C18.5 25.5 21.5 22.2 25 22.2 C28.5 22.2 31.5 25.5 31.5 30.5', 'M15 30.5 L13.5 35 M34 30.5 L35.5 35'] },
  'arbol': { color: 'verde', rellenos: [0], d: [
    'M15.6 22.6 C12.8 17.4 16.6 11.6 22 12.1 C25.1 8.7 31.4 9.7 32.9 14.6 C36.9 16.6 36.4 22.9 32 24.4 C30 27.9 24.6 28.4 22.1 26.4 C18.6 27.4 15 25.9 15.6 22.6 Z',
    'M24.6 26.6 C24.1 30 24.3 33.2 23.6 36.6', 'M17.6 37.4 C21 36.6 27 36.6 30.6 37.4'] },
  'cancha': { color: 'verde', d: [
    'M10 15 H38 V33 H10 Z', 'M24 15 V33', 'M28 24 A4 4 0 1 1 20 24 A4 4 0 1 1 28 24'] },
  'virgen': { color: 'verde', rellenos: [0], huecos: [1, 2], d: [
    'M13 37 V22 C13 13.5 35 13.5 35 22 V37 Z',
    'M24 19.5 C22.2 19.5 21 21 21 22.6 C21 24.2 22.2 25.5 24 25.5 C25.8 25.5 27 24.2 27 22.6 C27 21 25.8 19.5 24 19.5 Z',
    'M18.8 37 C19.3 31.5 21 28 24 27.4 C27 28 28.7 31.5 29.2 37 Z'] },
  'camino': { color: 'ocre', rellenos: [0], puntoTallado: true, puntos: [[15.7, 17.5, 1.2], [15.9, 23.5, 1.2], [32.3, 17.5, 1.2], [32.1, 23.5, 1.2]], d: [
    'M13 12 H18.5 C18 22 18.5 28.5 20.8 31 C22.7 33 25.3 33 27.2 31 C29.5 28.5 30 22 29.5 12 H35 C36 23 35.5 31 32 35 C28.5 39 19.5 39 16 35 C12.5 31 12 23 13 12 Z'] }
};

/* Nombre visible de cada tipo de lugar */
export const ETIQUETAS = {
  'mirador': 'Mirador', 'cueva': 'Cueva', 'guardaparques': 'Guardaparques', 'info': 'Información turística',
  'puesto': 'Puesto o rancho', 'banadero': 'Baño de vaca', 'toma-agua': 'Toma de agua', 'vado': 'Vado',
  'pirca': 'Pirca', 'mortero': 'Conana o mortero',
  'naciente': 'Arroyo o naciente', 'plaza': 'Plaza', 'cerro': 'Cerro', 'piedra': 'Roca', 'arbol': 'Monte nativo',
  'cancha': 'Cancha', 'virgen': 'Virgen',
  'camino': 'Camino Herradura'
};
export const etiquetaLugar = subtipo => ETIQUETAS[subtipo] || 'Lugar';

/* Color de categoría del ícono (clase pinC-*), para usarlo fuera del ícono, por ejemplo en los filtros */
export const colorDe = subtipo => (ICONOS[subtipo] || ICONOS.info).color;

const PIEDRA = 'M24.5 3.6 C33.8 3.2 42.6 9.8 44.3 19.6 C46.1 30.4 39.6 42.4 27.2 44.4 C14.6 46.3 4.4 38.6 3.7 26.4 C3 14.1 12.6 4.1 24.5 3.6 Z';

export function pinSvg(tipo) {
  const ic = ICONOS[tipo] || ICONOS.info;      // un subtipo desconocido no rompe el mapa
  const en = (lista, i) => (lista || []).includes(i);
  const clase = i => en(ic.rellenos, i) ? 'pinC-relleno' : en(ic.huecos, i) ? 'pinC-hueco' : en(ic.tallados, i) ? 'pinC-tallado' : 'pinC-linea';
  const trazos = ic.d.map((d, i) => `<path class="${clase(i)}" d="${d}"/>`).join('');
  const puntos = (ic.puntos || []).map(([x, y, r]) => `<circle class="${ic.puntoTallado ? 'pinC-punto-tallado' : 'pinC-punto'}" cx="${x}" cy="${y}" r="${r}"/>`).join('');
  return `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><g class="pinC pinC-${ic.color}"><path class="pinC-piedra" d="${PIEDRA}"/>${trazos}${puntos}</g></svg>`;
}

export const ICONO_VOLVER = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5 L8 12 L15 19"/></svg>';
