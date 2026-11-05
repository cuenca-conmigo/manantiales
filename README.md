# Mapa de la Reserva Los Manantiales

Sitio con el mapa interactivo de la **Reserva Hídrica Natural Municipal Los Manantiales** (Río Ceballos, Córdoba): límite de la reserva, arroyos, sitios del relevamiento de patrimonio con filtros por categoría y la leyenda del mapa.

Es un sitio estático: HTML, CSS y JavaScript sin paso de compilación. Usa [Leaflet 1.9.4](https://leafletjs.com) desde un CDN y el mapa base de OpenTopoMap.

## Verlo en la computadora

La página lee `data/reserva.geojson` con `fetch` y usa módulos de JavaScript, así que necesita un servidor local; abrir `index.html` con doble clic no funciona.

- **VS Code:** con la extensión Live Preview, clic derecho sobre `index.html` → *Show Preview*.
- **Cualquier otra forma:** desde la raíz, `npx serve` o `python -m http.server`, y abrir la dirección que muestra.

## Publicar

Sirve cualquier hosting estático con HTTPS (GitHub Pages, Netlify, Cloudflare Pages). El HTTPS es necesario para el botón **Mi ubicación**.

En GitHub Pages: *Settings → Pages → Deploy from a branch*, rama `main`, carpeta `/ (root)`.

## Estructura

```
index.html            Página: portada, mapa con panel y Cómo leer el mapa
css/
  base.css            Paleta (tokens), tema oscuro, tipografía, botones
  portada.css         Portada con logo e ilustración
  mapa.css            Mapa, controles, capas, íconos y mensajes
  panel.css           Panel lateral: filtros, listado y ficha
  secciones.css       Cómo leer el mapa
  vendor/leaflet.min.css
js/
  main.js             Arranque: carga los datos y conecta las partes
  config.js           Nombre, región, zoom, mapa base, ritmos de caminata
  util.js             Funciones chicas (distancias, formatos, escape de HTML)
  datos.js            Carga del GeoJSON y separación por tipo
  iconos.js           Íconos de pictografía y muestras de sendero
  mapa.js             Crea el mapa, el límite y la vista inicial
  capas.js            Arroyos, senderos, sitios y pin de la reserva
  abanico.js          Íconos que se pisan: se agrupan y se abren en círculo al pasar el mouse (o al primer toque)
  gestos.js           Rueda del mouse y gestos táctiles dentro de una página que scrollea
  avisos.js           Mensajes temporales sobre el mapa
  ubicacion.js        Botón Mi ubicación
  filtros.js          Filtros por categoría y subcategoría (mostrar u ocultar sitios)
  panel.js            Panel: filtros, listado, ficha (descripción, audio, fotos) y selección
  carrusel.js         Carrusel de fotos y videos de la ficha, y visor para verlos en grande
  leyenda.js          Cómo leer el mapa (según lo que haya en los datos)
data/reserva.geojson  Datos del mapa
media/fotos/<id>/     Fotos de cada sitio, ya achicadas y sin metadatos (las genera auxiliar/datos/preparar-medios.ps1)
media/audio/          Audio de cada sitio (<id>.ogg); los sitios sin audio no muestran reproductor
media/video/<id>/     Videos de cada sitio (01.mp4...) y su portada para el carrusel (01.jpg...)
img/                  Logo
auxiliar/             Lo que no es parte del sitio (ver auxiliar/README.md)
```

## Datos

Todo lo que muestra el mapa sale de `data/reserva.geojson`. Cada elemento lleva `properties.tipo`:

| tipo | Geometría | Propiedades | Se muestra como |
|---|---|---|---|
| `reserva` | Polygon | `nombre` | Límite (obligatorio, uno solo) |
| `arroyo` | LineString | `nombre` | Línea celeste con su nombre al pasar el mouse |
| `sendero` | LineString | `id`, `nombre`, `dificultad` (`alta`, `media`, `baja`), `descripcion`, opcionales `distancia_km` y `duracion` | Línea resaltada; aparece en el panel y en la leyenda |
| `poi` | Point | `id`, `subtipo`, `nombre`, opcionales `categoria`, `subcategoria`, `descripcion`, `audio`, `fotos` y `videos` (listas de rutas) | Ícono; aparece en el panel y en la leyenda, agrupado por `categoria`. Al tocarlo se abre su ficha |
| `recorrido` | LineString o MultiLineString | `sitio` (id de un `poi`), `nombre`, opcional `estilo` (`agua`) | Oculto; se resalta mientras ese sitio está elegido. Hay dos: el Camino Herradura (entre sus dos puntos de la planilla) y el Arroyo Mal Paso (todo el arroyo, en celeste) |

Subtipos de lugar con ícono (en `js/iconos.js`):

- De la reserva: `mirador`, `cueva`, `guardaparques`, `info`.
- Del relevamiento de patrimonio: `puesto`, `banadero`, `toma-agua`, `vado` (patrimonio rural), `pirca`, `mortero` (arqueológico), `naciente`, `plaza`, `cerro`, `piedra`, `arbol`, `cancha`, `virgen` (paisajístico, natural y simbólico) y `camino` (vía o senda histórica).

Para sumar uno nuevo, agregar su dibujo y su nombre en `js/iconos.js`. Los lugares sin `categoria` aparecen bajo "Lugares".

Los sitios salen de `auxiliar/datos/fuentes/valores-relevados.csv` (Categoría, Subcategoría, Sitio, Geolocalización y Descripción). Los que no traen coordenadas y tienen un recorrido (Arroyo Mal Paso, La Herradura) se ubican en el script; el resto sin coordenadas no aparece en el mapa.

Si un sendero no trae `distancia_km`, se calcula con la geometría; si no trae `duracion`, se estima con los ritmos de `js/config.js`.

La ficha de cada sitio muestra la descripción (o un espacio reservado si está vacía), un reproductor con `audio` (solo si el sitio tiene), un carrusel con los `videos` (primero, con su portada y un botón de reproducir) y las `fotos`; todo se abre en grande en un visor sobre la página.

Para regenerar los medios y el GeoJSON desde las fuentes, ver `auxiliar/datos/`.

## Fuentes y créditos

- Límite de la reserva: archivo `Manantiales.kmz` (1.043 ha).
- Arroyos, calles y lugares: © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright), licencia ODbL.
- Recorridos oficiales, horarios y ficha del Camino Herradura: [Turismo Río Ceballos](https://rioceballos.tur.ar/senderos-y-caminos/).
- Mapa base: © OpenStreetMap, SRTM, estilo © [OpenTopoMap](https://opentopomap.org) (CC-BY-SA). Su política pide no usarlo en sitios de mucho tráfico.
- Las ubicaciones de Las Pisaditas y del Destacamento de Guardaparques son aproximadas.
