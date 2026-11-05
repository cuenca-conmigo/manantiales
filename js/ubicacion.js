/* Botón "Mi ubicación": muestra a la persona en el mapa y la sigue mientras se mueve.
   Si se pasa alCambiar, lo llama con cada posición nueva (L.LatLng) y con null al apagarse. */
import { ZOOM } from './config.js';
import { vuelo } from './util.js';
import { ICONO_UBICACION } from './iconos.js';

export function agregarUbicacion(map, { region, avisar, alCambiar = () => {} }) {
  let boton, watchId = null, primerDato = true, punto = null, precision = null;

  const Control = L.Control.extend({
    options: { position: 'topright' },
    onAdd() {
      boton = L.DomUtil.create('button', 'loc-btn');
      boton.type = 'button';
      boton.innerHTML = ICONO_UBICACION;
      L.DomEvent.disableClickPropagation(boton);
      L.DomEvent.on(boton, 'click', alternar);
      return boton;
    }
  });
  new Control().addTo(map);
  marcarEstado(false);

  function marcarEstado(activa) {
    const texto = activa ? 'Dejar de mostrar mi ubicación' : 'Mostrar mi ubicación';
    boton.title = texto;
    boton.setAttribute('aria-label', texto);
    boton.setAttribute('aria-pressed', String(activa));
  }

  function alternar() {
    if (watchId !== null) return apagar();
    if (!('geolocation' in navigator)) return avisar('Este navegador no permite compartir la ubicación.');
    primerDato = true;
    boton.classList.add('is-buscando');
    watchId = navigator.geolocation.watchPosition(recibir, fallar, { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 });
  }

  function apagar() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    if (punto) { punto.remove(); precision.remove(); punto = precision = null; }
    boton.classList.remove('is-buscando');
    marcarEstado(false);
    alCambiar(null);
  }

  function recibir(pos) {
    const p = L.latLng(pos.coords.latitude, pos.coords.longitude), radio = pos.coords.accuracy;
    if (!punto) {
      precision = L.circle(p, { radius: radio, className: 'yo-precision', interactive: false }).addTo(map);
      punto = L.circleMarker(p, { radius: 8, className: 'yo-punto', interactive: false }).addTo(map);
    } else {
      precision.setLatLng(p).setRadius(radio);
      punto.setLatLng(p);
    }
    boton.classList.remove('is-buscando');
    marcarEstado(true);
    if (primerDato) {
      primerDato = false;
      if (region.contains(p)) map.flyTo(p, Math.max(map.getZoom(), ZOOM.ubicacion), vuelo(1.1));
      else avisar('Estás fuera de la zona que cubre el mapa.');
    }
    alCambiar(p);
  }

  function fallar(e) {
    apagar();
    avisar(e.code === 1
      ? 'No diste permiso para usar tu ubicación. Podés habilitarlo desde la configuración del navegador.'
      : 'No se pudo obtener tu ubicación. Revisá que el GPS esté prendido y probá de nuevo.');
  }
}
