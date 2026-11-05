/* Configuración del mapa. Lo que cambia si se reutiliza para otra reserva está acá. */

export const NOMBRE_CORTO = 'Los Manantiales';

/* GeoJSON con el límite, arroyos, senderos y sitios (ver README, "Datos") */
export const DATOS_URL = 'data/reserva.geojson';

/* Hasta dónde se puede mover el mapa: [[sur, oeste], [norte, este]] (Río Ceballos y alrededores).
   El zoom mínimo se calcula para que nunca se vea afuera de esta zona (ver js/mapa.js). */
export const REGION = [[-31.215, -64.405], [-31.125, -64.275]];

export const ZOOM = {
  min: 12,         // piso del zoom mínimo; en pantallas grandes sube para no salir de REGION
  max: 17,         // límite del mapa base
  detalle: 13,     // desde acá se ven senderos, lugares y arroyos; antes, solo el pin de la reserva
  lugar: 15,       // al elegir un lugar
  ubicacion: 14    // al encontrar la ubicación de la persona
};

export const MAPA_BASE = {
  url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  subdomains: 'abc',
  maxZoom: 17,
  attribution: 'Mapa y datos: © colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Estilo: © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
};

/* Velocidad orientativa para estimar el tiempo de un sendero sin duración oficial */
export const RITMO_KMH = { alta: 2.0, media: 2.5, baja: 3.0 };
