/* Dibuja los elementos del GeoJSON sobre el mapa */
import { ZOOM, NOMBRE_CORTO } from './config.js';
import { esc, ll, vuelo } from './util.js';
import { pinSvg } from './iconos.js';

const tooltip = { sticky: true, className: 'hand-tip', direction: 'top', offset: [0, -8] };

export function dibujarArroyos(map, arroyos) {
  arroyos.forEach(f => {
    const pts = f.geometry.coordinates.map(ll);
    L.polyline(pts, { className: 'arroyo-borde', interactive: false }).addTo(map);
    L.polyline(pts, { className: 'arroyo', interactive: false }).addTo(map);
    L.polyline(pts, { className: 'arroyo-hit', color: '#000', weight: 16, opacity: 0 })   // zona ancha para el tooltip
      .bindTooltip(esc(f.properties.nombre), tooltip).addTo(map);
  });
}

/* Recorridos asociados a un sitio (La Herradura, el Arroyo Mal Paso): están ocultos y se resaltan al elegir el sitio.
   Aceptan LineString o MultiLineString; properties.estilo = 'agua' los pinta como arroyo.
   Devuelve { idDelSitio: { halo, line } } */
export function dibujarRecorridos(map, recorridos) {
  const porSitio = {};
  recorridos.forEach(f => {
    const g = f.geometry;
    const pts = g.type === 'MultiLineString' ? g.coordinates.map(l => l.map(ll)) : g.coordinates.map(ll);
    const estilo = f.properties.estilo ? ` ${f.properties.estilo}` : '';
    porSitio[f.properties.sitio] = {
      halo: L.polyline(pts, { className: 'recorrido-halo' + estilo, interactive: false }).addTo(map),
      line: L.polyline(pts, { className: 'recorrido-line' + estilo, interactive: false }).addTo(map)
    };
  });
  return porSitio;
}

/* Cada sitio con su ícono. Los que se pisan en la pantalla los reparte js/abanico.js.
   alTocar(id, marker) se llama al tocar el ícono. Devuelve { id: { f, marker } } */
export function dibujarLugares(map, lugares, alTocar) {
  const porId = {};
  lugares.forEach(f => {
    const p = f.properties;
    const marker = L.marker(ll(f.geometry.coordinates), {
      icon: L.divIcon({ className: 'pin-wrap', html: `<span class="pin">${pinSvg(p.subtipo)}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
      title: p.nombre, alt: p.nombre, keyboard: true, riseOnHover: true
    }).addTo(map);
    marker.bindTooltip(esc(p.nombre), { className: 'hand-tip', direction: 'top', offset: [0, -22] });
    marker.on('click', () => alTocar(p.id, marker));
    porId[p.id] = { f, marker };
  });
  return porId;
}

/* De lejos (zoom < ZOOM.detalle) se ve solo un pin de la reserva; de cerca, el detalle.
   La clase is-lejos en el contenedor oculta o muestra cada cosa (ver css/mapa.css). */
export function activarNivelDetalle(map, contenedor, vista) {
  L.marker(vista.getCenter(), {
    icon: L.divIcon({ className: 'pin-reserva', iconSize: null, html: `<span class="pin-reserva-in">${pinSvg('reserva')}<span>${esc(NOMBRE_CORTO)}</span></span>` }),
    title: `Acercarse a la reserva ${NOMBRE_CORTO}`, alt: `Reserva ${NOMBRE_CORTO}`,
    keyboard: true, zIndexOffset: 1000
  }).on('click', () => map.flyToBounds(vista, vuelo(1.1))).addTo(map);

  /* is-medio: vista general de la reserva, los íconos se achican para no pisarse */
  const actualizar = () => {
    const z = map.getZoom();
    contenedor.classList.toggle('is-lejos', z < ZOOM.detalle);
    contenedor.classList.toggle('is-medio', z >= ZOOM.detalle && z < ZOOM.lugar);
  };
  map.on('zoomend', actualizar);
  actualizar();
}
