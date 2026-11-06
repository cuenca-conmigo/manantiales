/* Carga del GeoJSON y separación por tipo de elemento (ver README, "Datos") */
import { DATOS_URL } from './config.js';

export async function cargarDatos(url = DATOS_URL) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`No se pudo leer ${url} (${r.status})`);
  return separarPorTipo(await r.json());
}

/* Agrupa lugares por properties.categoria, en el orden de los datos.
   Los que no tienen categoría (los de la reserva) van primero, bajo "Lugares". Devuelve [[categoria, features], ...] */
export function porCategoria(features) {
  const grupos = new Map();
  features.forEach(f => {
    const cat = f.properties.categoria || 'Lugares';
    grupos.set(cat, [...(grupos.get(cat) || []), f]);
  });
  return [...grupos].sort(([a], [b]) => (a === 'Lugares' ? -1 : b === 'Lugares' ? 1 : 0));
}

export function separarPorTipo(geo) {
  const deTipo = t => (geo.features || []).filter(f => f.properties && f.properties.tipo === t);
  const reserva = deTipo('reserva')[0];
  if (!reserva) throw new Error('El GeoJSON no tiene un elemento con tipo "reserva" (el límite).');
  return {
    reserva,
    lugares: deTipo('poi'),
    arroyos: deTipo('arroyo'),
    recorridos: deTipo('recorrido')       // caminos que se resaltan al elegir su sitio (properties.sitio)
  };
}
