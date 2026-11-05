/* El mapa está dentro de una página que scrollea: la rueda del mouse y un dedo mueven la página.
   La rueda hace zoom recién después de hacer clic en el mapa; en pantallas táctiles el mapa se mueve con dos dedos. */
import { esTactil } from './util.js';

export function configurarGestos(map, mostrarPista) {
  const el = map.getContainer();
  el.addEventListener('wheel', () => {
    if (!map.scrollWheelZoom.enabled()) mostrarPista('Hacé clic en el mapa para hacer zoom con la rueda');
  }, { passive: true });
  el.addEventListener('pointerdown', () => map.scrollWheelZoom.enable());
  el.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());
  map.on('focus', () => map.scrollWheelZoom.enable());
  map.on('blur', () => map.scrollWheelZoom.disable());

  if (esTactil) {
    el.addEventListener('touchmove', e => {
      if (e.touches.length === 1) mostrarPista('Usá dos dedos para mover el mapa');
    }, { passive: true });
  }
}
