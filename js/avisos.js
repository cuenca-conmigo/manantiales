/* Mensajes que aparecen un rato sobre el mapa y se van solos */
export function crearMensaje(el, duracionMs) {
  let timer;
  return texto => {
    el.textContent = texto;
    el.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => { el.hidden = true; }, duracionMs);
  };
}
