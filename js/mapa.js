/* Crea el mapa de Leaflet: controles, mapa base, límite de la reserva y vista inicial */
import { REGION, ZOOM, MAPA_BASE } from './config.js';
import { ll, esTactil } from './util.js';

export function crearMapa(contenedor, reservaFeat) {
  const region = L.latLngBounds(REGION);
  const map = L.map(contenedor, {
    zoomControl: false, attributionControl: false,
    zoomSnap: 0.25, zoomDelta: 0.5, wheelPxPerZoomLevel: 90,
    minZoom: ZOOM.min, maxZoom: ZOOM.max, maxBounds: region, maxBoundsViscosity: 1,
    worldCopyJump: false, keyboard: true,
    scrollWheelZoom: false,          // se activa al hacer clic (ver gestos.js): la rueda primero scrollea la página
    dragging: !esTactil              // en pantallas táctiles se mueve con dos dedos; con uno se scrollea la página
  });
  L.control.zoom({ position: 'topright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(map);
  L.control.attribution({ prefix: '<a href="https://leafletjs.com">Leaflet</a>' }).addTo(map);
  L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);
  L.tileLayer(MAPA_BASE.url, { maxZoom: MAPA_BASE.maxZoom, subdomains: MAPA_BASE.subdomains, attribution: MAPA_BASE.attribution }).addTo(map);

  const anillo = reservaFeat.geometry.coordinates[0].map(ll);
  const limites = L.polygon(anillo, { className: 'reserva-poly', interactive: false }).addTo(map).getBounds();
  const vista = limites.pad(0.08);

  /* Zoom mínimo: el menor con el que la pantalla entera queda dentro de REGION (cambia con el tamaño de la ventana) */
  const ajustarZoomMinimo = () => map.setMinZoom(Math.max(ZOOM.min, map.getBoundsZoom(region, true)));
  ajustarZoomMinimo();
  map.on('resize', ajustarZoomMinimo);
  map.fitBounds(vista, { animate: false });

  /* Durante el zoom animado se apaga el filtro de mano alzada (ver css/mapa.css) para que no se trabe */
  const el = map.getContainer();
  map.on('zoomstart', () => el.classList.add('is-zooming'));
  map.on('zoomend', () => el.classList.remove('is-zooming'));

  return { map, region, anillo, limites, vista };
}
