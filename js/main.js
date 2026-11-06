/* Arranque de la página: carga los datos y conecta las partes */
import { cargarDatos } from './datos.js';
import { crearMapa } from './mapa.js';
import { dibujarArroyos, dibujarRecorridos, dibujarLugares, activarNivelDetalle } from './capas.js';
import { crearMensaje } from './avisos.js';
import { configurarGestos } from './gestos.js';
import { crearAbanicos } from './abanico.js';
import { crearFiltros } from './filtros.js';
import { crearPanel } from './panel.js';
import { dibujarLeyenda } from './leyenda.js';

const $ = id => document.getElementById(id);

async function iniciar() {
  let datos;
  try {
    datos = await cargarDatos();
  } catch (error) {
    console.error(error);
    $('panel').innerHTML = '<p class="hint">No se pudo cargar el mapa. Revisá tu conexión y recargá la página.</p>';
    return;
  }

  const contenedor = document.querySelector('.map-wrap');
  const { map, vista } = crearMapa($('map'), datos.reserva);

  dibujarArroyos(map, datos.arroyos);
  const recorridos = dibujarRecorridos(map, datos.recorridos);
  let panel, abanicos;  // se crean después de las capas, que los necesitan al tocarlas
  const lugares = dibujarLugares(map, datos.lugares, (id, marker) => {
    if (abanicos.interceptar(marker)) return;           // pantalla táctil: el primer toque abre el grupo
    panel.seleccionar(id, { desdeMapa: true });
  });
  activarNivelDetalle(map, contenedor, vista);
  abanicos = crearAbanicos(map, lugares, contenedor);   // después de activarNivelDetalle: necesita la escala ya actualizada

  const filtros = crearFiltros({ map, lugares });
  filtros.alCambiar(() => abanicos.recalcular());
  panel = crearPanel({ el: $('panel'), anuncio: $('anuncio'), map, vista, lugares, recorridos, filtros });
  map.on('click', () => { abanicos.cerrar(); if (panel.haySeleccion()) panel.limpiar(); });
  $('reset').addEventListener('click', () => panel.limpiar());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.haySeleccion()) panel.limpiar({ devolverFoco: true }); });

  configurarGestos(map, crearMensaje($('pista'), 1600));

  dibujarLeyenda($('leyenda'), datos);
}

iniciar();
