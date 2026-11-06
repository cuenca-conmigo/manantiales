/* Panel lateral: listado de sitios, ficha de cada uno y selección en el mapa.
   Es la alternativa accesible al mapa: todo lo que se puede tocar en el mapa también está acá. */
import { ZOOM } from './config.js';
import { carruselHtml, activarCarruseles, mediosDe } from './carrusel.js';
import { esc, ll, vuelo } from './util.js';
import { pinSvg, etiquetaLugar, ICONO_VOLVER } from './iconos.js';
import { porCategoria } from './datos.js';

/* La subcategoría del relevamiento, si la hay; si no, el nombre del tipo de ícono */
const tipoDeLugar = p => p.subcategoria || etiquetaLugar(p.subtipo);

export function crearPanel({ el, anuncio, map, vista, lugares, recorridos = {}, filtros }) {
  let sel = null;          // id del sitio elegido

  function listado() {
    const visibles = Object.values(lugares).map(o => o.f).filter(f => filtros.esVisible(f.properties));
    el.innerHTML = `
      <p class="hint">Tocá un ícono del mapa para ver sus datos.</p>
      ${filtros.html()}
      ${visibles.length
        ? porCategoria(visibles).map(([cat, fs]) => `<h3>${esc(cat)}</h3><ul class="list">${fs.map(itemLugar).join('')}</ul>`).join('')
        : '<p class="hint vacio">No hay sitios a la vista. Prendé alguna categoría o subcategoría de arriba.</p>'}`;
  }

  /* Al apretar un filtro se vuelve a armar el listado; el foco queda en el mismo botón */
  function refrescarFiltros(boton) {
    const selector = boton.dataset.clave ? `[data-clave="${CSS.escape(boton.dataset.clave)}"]`
      : boton.dataset.cat ? `[data-cat="${CSS.escape(boton.dataset.cat)}"]` : '[data-filtro="todo"]';
    const scroll = el.scrollTop;
    listado();
    el.scrollTop = scroll;
    const b = el.querySelector(selector);
    if (b) b.focus();
    anuncio.textContent = el.querySelector('.filtros-cuenta').textContent + ' a la vista.';
  }

  function itemLugar(f) {
    const p = f.properties;
    return `<li><button class="item" type="button" data-id="${esc(p.id)}">
      <span class="swatch-poi">${pinSvg(p.subtipo)}</span>
      <span><span class="name">${esc(p.nombre)}</span><br><span class="meta">${esc(tipoDeLugar(p))}</span></span>
      <span></span></button></li>`;
  }

  function ficha(id) {
    const volver = `<button class="btn" type="button" data-accion="volver">${ICONO_VOLVER}Volver al listado</button>`;
    const p = lugares[id].f.properties;
    el.innerHTML = `<div class="detail">${volver}
      <p class="kicker">${esc(tipoDeLugar(p))}</p>
      <h3 class="titulo" tabindex="-1" data-titulo>${esc(p.nombre)}</h3>
      ${p.categoria ? `<p class="ficha-categoria">${esc(p.categoria)}</p>` : ''}

      <section class="ficha-bloque" aria-labelledby="ficha-desc">
        <h4 id="ficha-desc">Descripción</h4>
        ${p.descripcion ? `<p class="desc">${esc(p.descripcion)}</p>` : '<p class="ficha-pendiente">La descripción de este sitio se va a sumar próximamente.</p>'}
      </section>

      ${p.audio ? `
      <section class="ficha-bloque" aria-labelledby="ficha-audio">
        <h4 id="ficha-audio">${esc(p.audio_titulo || 'Escuchar')}</h4>
        <audio class="ficha-audio" controls preload="none" src="${esc(p.audio)}">
          Este navegador no puede reproducir el audio. <a href="${esc(p.audio)}">Descargarlo</a>.
        </audio>
      </section>` : ''}

      <section class="ficha-bloque" aria-labelledby="ficha-fotos">
        <h4 id="ficha-fotos">${(p.videos || []).length ? 'Fotos y videos' : 'Fotos'}</h4>
        ${carruselHtml(mediosDe(p), p.nombre)}
      </section></div>`;
    activarCarruseles(el);
    return p.nombre;
  }

  /* Antes de reemplazar el contenido del panel se cortan audio y videos: quitados de la página pueden seguir sonando */
  function cortarAudio() { el.querySelectorAll('audio, video').forEach(a => a.pause()); }

  /* Marca en el mapa lo seleccionado y atenúa el resto */
  function pintar() {
    const marcar = (capa, clase, si) => { const e = capa.getElement && capa.getElement(); if (e) e.classList.toggle(clase, si); };
    Object.entries(lugares).forEach(([id, o]) => {
      marcar(o.marker, 'is-selected', sel === id);
      marcar(o.marker, 'is-dim', sel !== null && sel !== id);
    });
    /* El recorrido de un sitio (La Herradura, el Arroyo Mal Paso) se ve solo mientras ese sitio está elegido */
    Object.entries(recorridos).forEach(([id, r]) => {
      marcar(r.halo, 'is-selected', sel === id);
      marcar(r.line, 'is-selected', sel === id);
    });
  }

  function seleccionar(id, { desdeMapa = false } = {}) {
    if (!lugares[id]) return;
    sel = id;
    pintar();
    cortarAudio();
    const nombre = ficha(id);
    anuncio.textContent = `${nombre}. Datos en el panel.`;
    el.scrollTop = 0;
    if (recorridos[id]) map.flyToBounds(recorridos[id].line.getBounds(), { ...vuelo(0.6), padding: [50, 50] });
    else map.flyTo(ll(lugares[id].f.geometry.coordinates), Math.max(map.getZoom(), ZOOM.lugar), vuelo(0.6));
    if (!desdeMapa) el.querySelector('[data-titulo]').focus({ preventScroll: true });
  }

  function limpiar({ devolverFoco = false } = {}) {
    const anterior = sel;
    sel = null;
    pintar();
    cortarAudio();
    listado();
    anuncio.textContent = 'Listado de sitios.';
    map.flyToBounds(vista, vuelo(0.6));
    if (devolverFoco && anterior) {
      const b = el.querySelector(`.item[data-id="${CSS.escape(anterior)}"]`);
      if (b) b.focus();
    }
  }

  el.addEventListener('click', e => {
    if (filtros.manejarClic(e.target)) return refrescarFiltros(e.target.closest('[data-filtro]'));
    if (e.target.closest('[data-accion="volver"]')) return limpiar({ devolverFoco: true });
    const item = e.target.closest('.item');
    if (item) seleccionar(item.dataset.id);
  });

  listado();
  pintar();
  return { seleccionar, limpiar, haySeleccion: () => sel !== null };
}
