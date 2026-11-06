/* "Cómo leer el mapa": muestra solo lo que hay en los datos, con los lugares agrupados por categoría */
import { pinSvg, etiquetaLugar } from './iconos.js';
import { porCategoria } from './datos.js';
import { esc } from './util.js';

export function dibujarLeyenda(el, { lugares }) {
  const pin = tipo => `<span class="ley-pin">${pinSvg(tipo)}</span>`;
  const linea = (stroke, w, d = 'M4 9 H50') => `<svg viewBox="0 0 54 18" aria-hidden="true"><path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/></svg>`;
  const item = ([muestra, texto]) => `<li>${muestra}<span>${esc(texto)}</span></li>`;

  const generales = [
    [linea('var(--panel-soft)', 2), 'Calles y caminos vehiculares: los muestra el mapa base, sin resaltar'],
    [linea('var(--agua)', 3, 'M3 12 C12 4 18 15 28 9 S44 5 51 8'), 'Cauce de arroyo']
  ];

  /* Un ícono por tipo de lugar, dentro de su categoría. Si una subcategoría usa varios íconos
     (Formación rocosa: roca, mirador, cueva), se aclara cuál es cada uno */
  const grupos = porCategoria(lugares).map(([cat, fs]) => {
    const iconosPorSub = new Map();
    fs.forEach(f => {
      const sub = f.properties.subcategoria || etiquetaLugar(f.properties.subtipo);
      iconosPorSub.set(sub, new Set([...(iconosPorSub.get(sub) || []), f.properties.subtipo]));
    });
    const tipos = [...new Map(fs.map(f => {
      const p = f.properties, sub = p.subcategoria || etiquetaLugar(p.subtipo);
      return [p.subtipo, iconosPorSub.get(sub).size > 1 ? `${sub}: ${etiquetaLugar(p.subtipo).toLowerCase()}` : sub];
    }))];
    return `<li class="ley-grupo">${esc(cat)}</li>` + tipos.map(([t, nombre]) => item([pin(t), nombre])).join('');
  });

  el.innerHTML = generales.map(item).join('') + grupos.join('');
}
