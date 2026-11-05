/* Abanico: los íconos que se pisan en la pantalla más de la mitad (SUPERPOSICION) forman un grupo que se abre en círculo, en dos pasos:
   1. al pasar el mouse por el grupo se abre, sin mostrar nombres;
   2. al poner el cursor sobre uno de los íconos abiertos aparece su nombre, hacia afuera del círculo.
   El grupo sigue abierto mientras el cursor esté dentro del círculo. En una pantalla táctil, el primer toque
   abre el grupo y el segundo elige el sitio. Los grupos se recalculan al cambiar el zoom o los filtros.
   El ícono se mueve con las variables --dx y --dy de .pin (ver css/mapa.css); el marcador de Leaflet no se mueve. */

const TAM = 44;               // tamaño del ícono en px (sin escalar)
const SUPERPOSICION = 0.5;    // se agrupan si se pisan más de esta fracción del ancho del ícono
const ESPERA_CIERRE = 250;    // ms con el cursor fuera del círculo antes de cerrar

export function crearAbanicos(map, lugares, contenedor) {
  const marcadores = Object.values(lugares).map(o => o.marker);
  const grupoDe = new Map();  // marcador -> su grupo (solo grupos de 2 o más)
  let abierto = null, zona = null, timer = null, ultimoPuntero = 'mouse';

  /* En la vista general los íconos se ven más chicos (clase is-medio, ver js/capas.js) */
  const escala = () => (contenedor.classList.contains('is-medio') ? 0.68 : 1);
  const pin = m => m.getElement() && m.getElement().querySelector('.pin');
  const cancelarCierre = () => { clearTimeout(timer); timer = null; };

  /* Agrupa los íconos visibles que se tocan en la pantalla (si A pisa a B y B pisa a C, van los tres juntos) */
  function recalcular() {
    cerrar();
    grupoDe.clear();
    const vis = marcadores.filter(m => map.hasLayer(m));
    const pos = vis.map(m => map.latLngToLayerPoint(m.getLatLng()));
    const umbral = TAM * (1 - SUPERPOSICION) * escala();   // distancia entre centros por debajo de la cual se pisan de más
    const padre = vis.map((_, i) => i);
    const raiz = i => (padre[i] === i ? i : (padre[i] = raiz(padre[i])));
    for (let i = 0; i < vis.length; i++)
      for (let j = i + 1; j < vis.length; j++)
        if (pos[i].distanceTo(pos[j]) < umbral) padre[raiz(i)] = raiz(j);
    const grupos = new Map();
    vis.forEach((m, i) => grupos.set(raiz(i), [...(grupos.get(raiz(i)) || []), m]));
    grupos.forEach(g => { if (g.length > 1) g.forEach(m => grupoDe.set(m, g)); });
  }

  /* Corre el ícono y deja su nombre del lado de afuera del círculo, para que no tape a los otros */
  function mover(m, dx, dy) {
    const p = pin(m);
    if (p) { p.style.setProperty('--dx', `${dx}px`); p.style.setProperty('--dy', `${dy}px`); }
    if (m.getElement()) m.getElement().classList.toggle('en-abanico', dx !== 0 || dy !== 0);
    const t = m.getTooltip();
    if (!t) return;
    const r = TAM / 2 * escala();
    const lado = dx === 0 && dy === 0 ? 'top'
      : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top');
    t.options.direction = lado;
    t.options.offset = L.point(dx + (lado === 'right' ? r : lado === 'left' ? -r : 0), dy + (lado === 'bottom' ? r : lado === 'top' ? -r : 0));
    if (m.isTooltipOpen()) t.update();
  }

  /* Reparte el grupo en un círculo alrededor del centro de sus puntos, con lugar para todos los íconos */
  function abrir(g) {
    cancelarCierre();
    if (abierto === g) return;
    cerrar();
    abierto = g;
    const n = g.length;
    const ps0 = g.map(m => map.latLngToLayerPoint(m.getLatLng()));
    const centro = ps0.reduce((a, p) => a.add(p), L.point(0, 0)).divideBy(n);
    const radio = Math.max(TAM * 0.8 * escala(), (n * TAM * 1.15 * escala()) / (2 * Math.PI));
    zona = { centro: map.layerPointToContainerPoint(centro), radio: radio + TAM * 0.6 * escala() };

    /* Dónde va cada ícono en el círculo:
       - hacia el lado donde está de verdad respecto del centro (el de más al norte arriba, el del este a la derecha...);
       - sin caer encima de otro ícono visible de afuera del grupo (si no, no se lo podría tocar).
       Se prueban giros del círculo cada 15° y, en cada uno, todas las formas de repartir los íconos ordenados por su
       ángulo real; gana el de menor costo (pisar otro ícono cuesta mucho más que desviarse). Los que están en el mismo
       punto exacto empatan y mantienen el orden de los datos. */
    const DOS_PI = 2 * Math.PI;
    const angulo = p => (p.distanceTo(centro) < 0.5 ? 0 : (Math.atan2(p.y - centro.y, p.x - centro.x) + Math.PI / 2 + DOS_PI) % DOS_PI);
    const items = g.map((m, i) => ({ m, p: ps0[i], i, a: angulo(ps0[i]) })).sort((x, y) => x.a - y.a || x.i - y.i);
    const distAng = (x, y) => { const d = Math.abs(x - y) % DOS_PI; return Math.min(d, DOS_PI - d); };
    const vecinos = marcadores.filter(m => map.hasLayer(m) && !g.includes(m)).map(m => map.latLngToLayerPoint(m.getLatLng()))
      .filter(p => p.distanceTo(centro) < radio + TAM * 2 * escala());
    const lugar = a => centro.add(L.point(Math.cos(a - Math.PI / 2) * radio, Math.sin(a - Math.PI / 2) * radio));
    const pisa = q => vecinos.some(v => v.distanceTo(q) < TAM * 0.85 * escala());
    let mejor = { costo: Infinity, inicio: 0, giro: 0 };
    for (let paso = 0; paso < 24; paso++) {
      const inicio = (paso * DOS_PI) / 24;
      for (let r = 0; r < n; r++) {
        const costo = items.reduce((s, it, k) => {
          const a = inicio + (DOS_PI * ((k + r) % n)) / n;
          return s + distAng(it.a, a) + (pisa(lugar(a)) ? 100 : 0);
        }, 0) + inicio * 1e-3;                            // a igual costo, el giro más chico (arriba primero)
        if (costo < mejor.costo - 1e-9) mejor = { costo, inicio, giro: r };
      }
    }
    items.forEach((it, k) => {
      const d = lugar(mejor.inicio + (DOS_PI * ((k + mejor.giro) % n)) / n).subtract(it.p);
      it.m.closeTooltip();                               // paso 1: se abre sin nombres
      mover(it.m, Math.round(d.x), Math.round(d.y));
    });
  }

  function cerrar() {
    cancelarCierre();
    if (!abierto) return;
    abierto.forEach(m => { m.closeTooltip(); mover(m, 0, 0); });
    abierto = zona = null;
  }

  marcadores.forEach(m => {
    m.on('mouseover', () => {
      const g = grupoDe.get(m);
      if (g && abierto !== g) abrir(g);                   // paso 1 (el nombre que abrió Leaflet se cierra en abrir)
      // paso 2 lo resuelve Leaflet: muestra el nombre del ícono. Pasar por un ícono de afuera del grupo no cierra
      // el abanico: se cierra al salir del círculo (ver mousemove)
    });
  });
  /* Mientras el cursor esté dentro del círculo el grupo sigue abierto; afuera, se cierra al rato */
  map.on('mousemove', e => {
    if (!zona) return;
    if (e.containerPoint.distanceTo(zona.centro) <= zona.radio) cancelarCierre();
    else if (!timer) timer = setTimeout(cerrar, ESPERA_CIERRE);
  });
  map.getContainer().addEventListener('mouseleave', cerrar);
  map.getContainer().addEventListener('pointerdown', e => { ultimoPuntero = e.pointerType; }, true);
  map.on('zoomstart movestart', cerrar);
  map.on('zoomend', recalcular);
  recalcular();

  return {
    recalcular,
    cerrar,
    /* Al tocar un ícono: en pantalla táctil, si su grupo está cerrado, el toque lo abre (devuelve true y no se elige) */
    interceptar(m) {
      const g = grupoDe.get(m);
      if (g && abierto !== g && ultimoPuntero !== 'mouse') { abrir(g); return true; }
      return false;
    }
  };
}
