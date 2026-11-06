# Mapa de la Reserva Los Manantiales

Sitio con el mapa interactivo de la **Reserva Hídrica Natural Municipal Los Manantiales** (Río Ceballos, Córdoba): límite de la reserva, arroyos y los sitios del relevamiento de patrimonio, con filtros por categoría, una ficha por sitio (descripción, testimonio, fotos y videos) y la leyenda del mapa.

Es un sitio estático: HTML, CSS y JavaScript sin paso de compilación. Usa [Leaflet 1.9.4](https://leafletjs.com) desde un CDN y el mapa base de OpenTopoMap.

## Verlo en la computadora

La página lee `data/reserva.geojson` con `fetch` y usa módulos de JavaScript, así que necesita un servidor local; abrir `index.html` con doble clic no funciona.

- **VS Code:** con la extensión Live Preview, clic derecho sobre `index.html` → *Show Preview*.
- **Cualquier otra forma:** desde la raíz, `npx serve` o `python -m http.server`, y abrir la dirección que muestra.

## Publicar

Sirve cualquier hosting estático (GitHub Pages, Netlify, Cloudflare Pages).

En GitHub Pages: *Settings → Pages → Deploy from a branch*, rama `main`, carpeta `/ (root)`.

## Estructura

```
index.html            Página: portada, mapa con panel y Cómo leer el mapa
css/
  base.css            Paleta (tokens), tema oscuro, tipografía y reset
  portada.css         Portada con logo e ilustración de las sierras
  mapa.css            Mapa, controles, capas, íconos, abanico y mensajes
  panel.css           Panel lateral: filtros, listado, ficha, carrusel y visor
  secciones.css       Cómo leer el mapa
  vendor/leaflet.min.css
js/
  main.js             Arranque: carga los datos y conecta las partes
  config.js           Nombre, región, niveles de zoom y mapa base
  util.js             Funciones chicas (coordenadas, animaciones, escape de HTML)
  datos.js            Carga del GeoJSON, separación por tipo y orden por categoría
  iconos.js           Íconos de pictografía de cada tipo de sitio
  mapa.js             Crea el mapa, el límite, la vista inicial y el zoom limitado a Río Ceballos
  capas.js            Arroyos, recorridos, sitios y pin de la reserva al alejarse
  abanico.js          Íconos que se pisan: se abren en círculo al pasar el mouse (o al primer toque)
  gestos.js           Rueda del mouse y gestos táctiles dentro de una página que scrollea
  avisos.js           Mensaje temporal sobre el mapa (cómo hacer zoom)
  filtros.js          Filtros por categoría y subcategoría (mostrar u ocultar sitios)
  panel.js            Panel: filtros, listado, ficha de cada sitio y selección en el mapa
  carrusel.js         Carrusel de fotos y videos de la ficha, y visor para verlos en grande
  leyenda.js          Cómo leer el mapa (según lo que haya en los datos)
data/reserva.geojson  Datos del mapa
media/fotos/<id>/     Fotos de cada sitio (01.jpg...), de 2000 px como máximo y sin metadatos
media/audio/          Testimonio o audio de cada sitio (<id>.m4a u .ogg); los sitios sin audio no muestran reproductor
media/video/<id>/     Videos de cada sitio (01.mp4...) y su portada para el carrusel (01.jpg...)
img/                  Logo
```

## Datos

Todo lo que muestra el mapa sale de `data/reserva.geojson`. Cada elemento lleva `properties.tipo`:

| tipo | Geometría | Propiedades | Se muestra como |
|---|---|---|---|
| `reserva` | Polygon | `nombre` | Límite (obligatorio, uno solo) |
| `arroyo` | LineString | `nombre` | Línea celeste con su nombre al pasar el mouse |
| `poi` | Point | `id`, `subtipo`, `nombre`, `categoria`, `subcategoria`, opcionales `descripcion`, `audio`, `audio_titulo`, `fotos` y `videos` | Ícono; aparece en el panel y en la leyenda, agrupado por `categoria`. Al tocarlo se abre su ficha |
| `recorrido` | LineString o MultiLineString | `sitio` (id de un `poi`), `nombre`, opcional `estilo` (`agua`) | Oculto; se resalta mientras ese sitio está elegido. Hay dos: La Herradura (de la entrada por calle Brown a la de calle Alberdi) y el Arroyo Mal Paso (todo el arroyo, en celeste) |

La ficha de cada sitio muestra:

- La **descripción**, o un aviso de que se va a sumar próximamente.
- El **audio**, solo si el sitio tiene. Se titula con `audio_titulo` ("Escuchar testimonio" en La Agüita y la Pileta de Rizzo) o, si falta, "Escuchar".
- Un **carrusel** con los `videos` primero (con su portada y un botón de reproducir) y después las `fotos`. Todo se abre en grande en un visor sobre la página.

Subtipos con ícono (en `js/iconos.js`): `puesto`, `banadero`, `toma-agua`, `vado` (patrimonio rural), `pirca`, `mortero` (arqueológico), `naciente`, `plaza`, `cerro`, `piedra`, `arbol`, `cancha`, `virgen`, `mirador`, `cueva` (natural, paisajístico y simbólico), `camino` (vía o senda histórica) y `guardaparques` (referencias). Para sumar uno nuevo, agregar su dibujo y su nombre en `js/iconos.js`.

Los sitios salen de la planilla de valores relevados (Categoría, Subcategoría, Sitio, Geolocalización y Descripción). Arroyo Mal Paso, La Herradura y Monte nativo no traen coordenadas en la planilla y se ubican aparte; el Destacamento de Guardaparques no está en la planilla y se suma como referencia. El resto de los sitios sin coordenadas no aparece en el mapa.
## Cómo se arman los datos y los medios

El GeoJSON y la carpeta `media/` se generan con scripts de PowerShell a partir de la planilla, el KMZ del límite, OpenStreetMap y las fotos, audios y videos originales del relevamiento. Los scripts, las fuentes y los originales (con testimonios de vecinos) se guardan fuera del repositorio, en `auxiliar/` e `images/`, y no se publican.

## Fuentes y créditos

- Límite de la reserva: archivo `Manantiales.kmz` (1.043 ha).
- Sitios, descripciones, fotos y testimonios: relevamiento de valores patrimoniales de la reserva.
- Arroyos y el trazado de La Herradura: © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright), licencia ODbL.
- Mapa base: © OpenStreetMap, SRTM, estilo © [OpenTopoMap](https://opentopomap.org) (CC-BY-SA). Su política pide no usarlo en sitios de mucho tráfico.
- Las ubicaciones de Las Pisaditas y del Destacamento de Guardaparques son aproximadas.
