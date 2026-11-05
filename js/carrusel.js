/* Carrusel de fotos y videos de un sitio, y visor para verlos en grande.
   - Carrusel: un elemento por vez, centrado; se desliza con el dedo (scroll-snap) o con los botones.
     Los videos se ven como una foto (su portada, un cuadro del video) con un botón de reproducir encima.
   - Visor: al tocar un elemento se abre en grande sobre la página (un <dialog>); los videos se reproducen ahí.
     Con flechas se pasa de uno a otro, y al cerrarlo el carrusel queda en el último que se vio.
   medios: [{ tipo: 'foto' | 'video', src, portada? }]. carruselHtml arma el marcado; activarCarruseles le da vida. */
import { esc } from './util.js';

const ICONO_PLAY = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22"/><path d="M19 15 L35 24 L19 33 Z"/></svg>';

/* Fotos y videos de un sitio en el orden del carrusel: primero los videos, después las fotos */
export function mediosDe(p) {
  return [
    ...(p.videos || []).map(src => ({ tipo: 'video', src, portada: src.replace(/\.[^.]+$/, '.jpg') })),
    ...(p.fotos || []).map(src => ({ tipo: 'foto', src }))
  ];
}

export function carruselHtml(medios, nombre) {
  if (!medios.length) return '<p class="ficha-pendiente">Todavía no hay fotos de este sitio.</p>';
  const n = medios.length;
  const items = medios.map((m, i) => {
    const que = m.tipo === 'video' ? 'video' : 'foto';
    const etiqueta = m.tipo === 'video' ? `Reproducir el video (${i + 1} de ${n})` : `Ver en grande la foto ${i + 1} de ${n}`;
    return `
    <li class="carrusel-foto">
      <button class="carrusel-abrir${m.tipo === 'video' ? ' es-video' : ''}" type="button" data-i="${i}" aria-label="${etiqueta}">
        <img src="${esc(m.tipo === 'video' ? m.portada : m.src)}" alt="${esc(nombre)}, ${que} ${i + 1} de ${n}" loading="lazy" decoding="async"
          ${m.tipo === 'video' ? 'onerror="this.removeAttribute(\'src\')"' : ''}>
        ${m.tipo === 'video' ? `<span class="carrusel-play">${ICONO_PLAY}</span>` : ''}
      </button>
    </li>`;
  }).join('');
  return `<div class="carrusel" data-carrusel data-nombre="${esc(nombre)}" data-medios="${esc(JSON.stringify(medios))}">
    <ul class="carrusel-pista" aria-label="Fotos y videos de ${esc(nombre)}">${items}</ul>
    ${n > 1 ? `<div class="carrusel-controles">
      <button class="carrusel-btn" type="button" data-paso="-1" aria-label="Anterior">‹</button>
      <span class="carrusel-cuenta" aria-live="polite">1 de ${n}</span>
      <button class="carrusel-btn" type="button" data-paso="1" aria-label="Siguiente">›</button>
    </div>` : ''}
  </div>`;
}

export function activarCarruseles(contenedor) {
  contenedor.querySelectorAll('[data-carrusel]').forEach(c => {
    const pista = c.querySelector('.carrusel-pista');
    const fotos = [...pista.children];
    const total = fotos.length;
    const cuenta = c.querySelector('.carrusel-cuenta');
    const [antes, despues] = c.querySelectorAll('.carrusel-btn');
    const medios = JSON.parse(c.dataset.medios).map((m, i) => ({ ...m, alt: fotos[i].querySelector('img').alt }));

    /* Los botones llevan la cuenta (no esperan a que termine el desplazamiento suave);
       al deslizar con el dedo, el elemento más cercano al borde izquierdo la corrige */
    let i = 0;
    const mostrar = () => {
      if (!cuenta) return;
      cuenta.textContent = `${i + 1} de ${total}`;
      antes.disabled = i === 0;
      despues.disabled = i === total - 1;
    };
    let destino = null;            // mientras un botón está moviendo la tira, no se corrige la cuenta
    const ir = (n, suave = true) => {
      i = Math.max(0, Math.min(total - 1, n));
      destino = fotos[i].offsetLeft - pista.offsetLeft;
      // 'instant' y no 'auto': con 'auto' manda el scroll-behavior: smooth del CSS
      pista.scrollTo({ left: destino, behavior: suave ? 'smooth' : 'instant' });
      mostrar();
    };

    c.addEventListener('click', e => {
      const paso = e.target.closest('[data-paso]');
      if (paso) return ir(i + Number(paso.dataset.paso));
      const abrir = e.target.closest('.carrusel-abrir');
      if (abrir) abrirVisor(medios, Number(abrir.dataset.i), c.dataset.nombre, (ultima, foco) => { ir(ultima, false); foco && fotos[ultima].querySelector('button').focus(); });
    });
    let timer;
    pista.addEventListener('scroll', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const x = pista.scrollLeft;
        if (destino !== null) {      // llegó adonde la mandó el botón: desde acá vuelve a mandar el dedo
          if (Math.abs(x - destino) < 2) destino = null;
          return;
        }
        i = fotos.reduce((mejor, li, k) => (Math.abs(li.offsetLeft - pista.offsetLeft - x) < Math.abs(fotos[mejor].offsetLeft - pista.offsetLeft - x) ? k : mejor), 0);
        mostrar();
      }, 120);
    }, { passive: true });
    pista.addEventListener('pointerdown', () => { destino = null; });   // si la persona agarra la tira, manda ella
    mostrar();
  });
}

/* ---------- Visor: un único <dialog> para toda la página ---------- */
let visor;
function crearVisor() {
  visor = document.createElement('dialog');
  visor.className = 'visor';
  visor.innerHTML = `
    <button class="visor-cerrar" type="button" aria-label="Cerrar">×</button>
    <figure class="visor-figura">
      <img class="visor-img" alt="">
      <video class="visor-video" controls playsinline preload="metadata" hidden></video>
      <figcaption class="visor-cuenta" aria-live="polite"></figcaption>
    </figure>
    <button class="visor-nav visor-ant" type="button" data-paso="-1" aria-label="Anterior">‹</button>
    <button class="visor-nav visor-sig" type="button" data-paso="1" aria-label="Siguiente">›</button>`;
  document.body.append(visor);

  visor.addEventListener('click', e => {
    if (e.target === visor || e.target.closest('.visor-cerrar')) return visor.close();   // tocar afuera también cierra
    const paso = e.target.closest('[data-paso]');
    if (paso) visor.mover(Number(paso.dataset.paso));
  });
  visor.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') visor.mover(-1);
    if (e.key === 'ArrowRight') visor.mover(1);
    e.stopPropagation();       // que Escape cierre solo el visor y no también la ficha del sitio
  });
  visor.addEventListener('close', () => {
    detenerVideo();
    document.documentElement.classList.remove('visor-abierto');
    visor.alCerrar && visor.alCerrar(visor.i, true);
  });
}

function detenerVideo() {
  const v = visor.querySelector('.visor-video');
  v.pause();
  v.removeAttribute('src');
  v.load();                    // libera el video
}

function abrirVisor(medios, inicio, nombre, alCerrar) {
  if (!visor) crearVisor();
  const img = visor.querySelector('.visor-img');
  const video = visor.querySelector('.visor-video');
  const cuenta = visor.querySelector('.visor-cuenta');
  const [ant, sig] = visor.querySelectorAll('.visor-nav');
  const total = medios.length;
  visor.setAttribute('aria-label', `Fotos y videos de ${nombre}`);
  visor.alCerrar = alCerrar;
  visor.mover = paso => mostrar(visor.i + paso);
  function mostrar(n) {
    visor.i = Math.max(0, Math.min(total - 1, n));
    const m = medios[visor.i];
    detenerVideo();
    if (m.tipo === 'video') {
      img.hidden = true;
      video.hidden = false;
      video.poster = m.portada || '';
      video.src = m.src;
      video.setAttribute('aria-label', m.alt);
      video.play().catch(() => {});                       // si el navegador no deja reproducir solo, queda el botón
    } else {
      video.hidden = true;
      img.hidden = false;
      img.src = m.src;
      img.alt = m.alt;
    }
    cuenta.textContent = total > 1 ? `${visor.i + 1} de ${total}` : '';
    ant.hidden = sig.hidden = total < 2;
    ant.disabled = visor.i === 0;
    sig.disabled = visor.i === total - 1;
  }
  mostrar(inicio);
  document.documentElement.classList.add('visor-abierto');
  visor.showModal();
  visor.querySelector('.visor-cerrar').focus();
}
