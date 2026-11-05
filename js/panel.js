/* Panel lateral: listado de senderos y lugares, ficha de detalle y selección en el mapa.
   Es la alternativa accesible al mapa: todo lo que se puede tocar en el mapa también está acá. */
import { ZOOM } from './config.js';
import { carruselHtml, activarCarruseles, mediosDe } from './carrusel.js';
import { esc, ll, fmtKm, capital, vuelo } from './util.js';
import { pinSvg, etiquetaLugar, muestraSendero, ICONO_VOLVER } from './iconos.js';
import { porCategoria } from './datos.js';

/* La subcategoría del relevamiento, si la hay; si no, el nombre del tipo de ícono */
const tipoDeLugar = p => p.subcategoria || etiquetaLugar(p.subtipo);

export function crearPanel({ el, anuncio, map, vista, senderos, lugares, recorridos = {}, filtros }) {
  let sel = null;          // { tipo: 'sendero' | 'lugar', id }

  function listado() {
    const visibles = Object.values(lugares).map(o => o.f).filter(f => filtros.esVisible(f.properties));
    const itemsSenderos = Object.values(senderos).map(t => {
      const p = t.f.properties;
      return `<li><button class="item" type="button" data-tipo="sendero" data-id="${esc(p.id)}">
        ${muestraSendero(p.dificultad)}
        <span><span class="name">${esc(p.nombre)}</span><br><span class="meta">Dificultad ${esc(p.dificultad)}</span></span>
        <span class="dist">${fmtKm(t.km)}</span></button></li>`;
    }).join('');
    const haySenderos = itemsSenderos.length > 0;
    el.innerHTML = `
      <p class="hint">${haySenderos ? 'Tocá un sendero o un ícono del mapa para ver sus datos.' : 'Tocá un ícono del mapa para ver sus datos.'}</p>
      ${filtros.html()}
      ${haySenderos ? `<h3>Senderos</h3><ul class="list">${itemsSenderos}</ul>` : ''}
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
    return `<li><button class="item" type="button" data-tipo="lugar" data-id="${esc(p.id)}">
      <span class="swatch-poi">${pinSvg(p.subtipo)}</span>
      <span><span class="name">${esc(p.nombre)}</span><br><span class="meta">${esc(tipoDeLugar(p))}</span></span>
      <span></span></button></li>`;
  }

  function ficha(tipo, id) {
    const volver = `<button class="btn" type="button" data-accion="volver">${ICONO_VOLVER}Volver al listado</button>`;
    if (tipo === 'sendero') {
      const t = senderos[id], p = t.f.properties;
      el.innerHTML = `<div class="detail">${volver}
        <p class="kicker">Sendero</p>
        <h3 class="titulo" tabindex="-1" data-titulo>${esc(p.nombre)}</h3>
        <dl class="stats">
          <div class="stat"><dt>Distancia</dt><dd class="big">${fmtKm(t.km)}</dd></div>
          <div class="stat"><dt>Dificultad</dt><dd><span class="badge ${esc(p.dificultad)}">${muestraSendero(p.dificultad)}${esc(capital(p.dificultad))}</span></dd></div>
          <div class="stat"><dt>Tiempo aproximado</dt><dd>${esc(t.tiempo)}</dd></div>
        </dl>
        <p class="desc">${esc(p.descripcion || '')}</p></div>`;
      return p.nombre;
    }
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
        <h4 id="ficha-audio">Escuchar</h4>
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
    Object.entries(senderos).forEach(([id, t]) => {
      const es = !!sel && sel.tipo === 'sendero' && sel.id === id;
      marcar(t.halo, 'is-selected', es);
      marcar(t.line, 'is-selected', es);
      marcar(t.line, 'is-dim', !!sel && !es);
    });
    Object.entries(lugares).forEach(([id, o]) => {
      const es = !!sel && sel.tipo === 'lugar' && sel.id === id;
      marcar(o.marker, 'is-selected', es);
      marcar(o.marker, 'is-dim', !!sel && !es);
    });
    /* El recorrido de un sitio (Camino Herradura) se ve solo mientras ese sitio está elegido */
    Object.entries(recorridos).forEach(([id, r]) => {
      const es = !!sel && sel.tipo === 'lugar' && sel.id === id;
      marcar(r.halo, 'is-selected', es);
      marcar(r.line, 'is-selected', es);
    });
  }

  function seleccionar(tipo, id, { desdeMapa = false } = {}) {
    if (!(tipo === 'sendero' ? senderos[id] : lugares[id])) return;
    sel = { tipo, id };
    pintar();
    cortarAudio();
    const nombre = ficha(tipo, id);
    anuncio.textContent = `${nombre}. Datos en el panel.`;
    el.scrollTop = 0;
    if (tipo === 'sendero') map.flyToBounds(senderos[id].line.getBounds(), { ...vuelo(0.6), padding: [70, 70] });
    else if (recorridos[id]) map.flyToBounds(recorridos[id].line.getBounds(), { ...vuelo(0.6), padding: [50, 50] });
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
      const b = el.querySelector(`[data-tipo="${anterior.tipo}"][data-id="${CSS.escape(anterior.id)}"]`);
      if (b) b.focus();
    }
  }

  el.addEventListener('click', e => {
    if (filtros.manejarClic(e.target)) return refrescarFiltros(e.target.closest('[data-filtro]'));
    if (e.target.closest('[data-accion="volver"]')) return limpiar({ devolverFoco: true });
    const item = e.target.closest('.item');
    if (item) seleccionar(item.dataset.tipo, item.dataset.id);
  });

  listado();
  pintar();
  return { seleccionar, limpiar, haySeleccion: () => sel !== null };
}
