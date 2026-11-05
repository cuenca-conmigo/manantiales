/* Filtros por categoría y subcategoría: botones que muestran u ocultan sitios del mapa y del listado.
   Una categoría está "prendida" si se ven todas sus subcategorías, "a medias" si se ven algunas. */
import { esc } from './util.js';
import { pinSvg, colorDe } from './iconos.js';
import { porCategoria } from './datos.js';

export function crearFiltros({ map, lugares }) {          // lugares: { id: { f, marker } }
  const ocultas = new Set();                               // claves "categoria|subcategoria"
  const clave = p => `${p.categoria || ''}|${p.subcategoria || p.subtipo}`;
  const features = Object.values(lugares).map(o => o.f);
  const oyentes = [];

  /* Árbol: [{ categoria, color, subs: [{ clave, nombre, subtipo, cantidad }] }] */
  const arbol = porCategoria(features).map(([categoria, fs]) => {
    const subs = new Map();
    fs.forEach(f => {
      const p = f.properties, k = clave(p);
      if (!subs.has(k)) subs.set(k, { clave: k, nombre: p.subcategoria || p.subtipo, subtipo: p.subtipo, cantidad: 0 });
      subs.get(k).cantidad++;
    });
    return { categoria, color: colorDe(fs[0].properties.subtipo), subs: [...subs.values()] };
  });

  const esVisible = p => !ocultas.has(clave(p));

  function aplicar() {
    Object.values(lugares).forEach(({ f, marker }) => {
      const ver = esVisible(f.properties);
      if (ver && !map.hasLayer(marker)) marker.addTo(map);
      if (!ver && map.hasLayer(marker)) marker.remove();
    });
    oyentes.forEach(fn => fn());
  }

  /* Si todas las claves están visibles, las oculta; si no, las muestra */
  function alternar(claves) {
    const todasVisibles = claves.every(k => !ocultas.has(k));
    claves.forEach(k => (todasVisibles ? ocultas.add(k) : ocultas.delete(k)));
    aplicar();
  }

  const estadoCategoria = c => {
    const vis = c.subs.filter(s => !ocultas.has(s.clave)).length;
    return vis === c.subs.length ? 'true' : vis === 0 ? 'false' : 'mixed';
  };

  function html() {
    const total = Object.keys(lugares).length;
    const visibles = features.filter(f => esVisible(f.properties)).length;
    return `<div class="filtros">
      <div class="filtros-cabecera">
        <h3>Qué ver en el mapa</h3>
        <button class="btn-texto" type="button" data-filtro="todo">${ocultas.size ? 'Mostrar todo' : 'Ocultar todo'}</button>
      </div>
      <p class="filtros-cuenta">${visibles === total ? `${total} sitios` : `${visibles} de ${total} sitios`}</p>
      ${arbol.map(c => `
        <div class="filtro-cat pinC-${c.color}">
          <button class="filtro-cat-btn" type="button" data-filtro="cat" data-cat="${esc(c.categoria)}" aria-pressed="${estadoCategoria(c)}">
            <span class="filtro-marca" aria-hidden="true"></span>${esc(c.categoria)}
          </button>
          <ul class="filtro-subs">${c.subs.map(s => `
            <li><button class="chip" type="button" data-filtro="sub" data-clave="${esc(s.clave)}" aria-pressed="${!ocultas.has(s.clave)}">
              <span class="chip-ico">${pinSvg(s.subtipo)}</span>${esc(s.nombre)}<span class="filtro-n" aria-label="${s.cantidad} sitios">${s.cantidad}</span>
            </button></li>`).join('')}
          </ul>
        </div>`).join('')}
    </div>`;
  }

  /* Devuelve true si el clic era de un filtro (y lo aplicó) */
  function manejarClic(objetivo) {
    const b = objetivo.closest('[data-filtro]');
    if (!b) return false;
    const tipo = b.dataset.filtro;
    if (tipo === 'sub') alternar([b.dataset.clave]);
    if (tipo === 'cat') alternar(arbol.find(c => c.categoria === b.dataset.cat).subs.map(s => s.clave));
    if (tipo === 'todo') {
      const todas = arbol.flatMap(c => c.subs.map(s => s.clave));
      if (ocultas.size) ocultas.clear(); else todas.forEach(k => ocultas.add(k));
      aplicar();
    }
    return true;
  }

  return { html, manejarClic, esVisible, alCambiar: fn => oyentes.push(fn) };
}
