# Datos del globo de bienvenida

El globo combina una base cartográfica global con mediciones georreferenciadas. No usa la imagen de un hemisferio como textura para inventar el opuesto. La ficha «Altura de bosques» de la colección conserva su imagen y su periodo originales; el globo utiliza el producto complementario descrito aquí.

## Altura del dosel

- Fuente: [Lang et al., Global canopy top height estimates from GEDI LIDAR waveforms for 2019, versión 1.1](https://doi.org/10.5281/zenodo.5704852).
- Autores: Nico Lang, Nikolai Kalischek, John Armston, Konrad Schindler, Ralph Dubayah y Jan Dirk Wegner.
- Estudio: Lang et al. (2022), *Global canopy height regression and uncertainty estimation from GEDI LIDAR waveforms with deep ensembles*, Remote Sensing of Environment, 268, 112760.
- Licencia: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Datos: estimaciones RH98 a partir de GEDI L1B, abril–julio de 2019, agregadas en celdas de 0,5 grados, aproximadamente entre 51,6° N y S. No es un mapa actualizado en tiempo real ni una cobertura completa de todos los bosques.
- Archivo fuente: `canopy_height_2019.tif`, 720 × 360 píxeles, WGS84 / EPSG:4326. Origen: 180° O, 90° N; filas de norte a sur.
- SHA-256: `0176baf903634176da15c4b7c435dc9fb442b899a43e7ffbef3c46bd376be4fc`.

## Geografía

Base: [Natural Earth, land a escala 1:110 millones](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson), de [dominio público](https://www.naturalearthdata.com/about/terms-of-use/). Los contornos están generalizados para visualización global; no sirven para mediciones de costas o límites.

SHA-256 del GeoJSON usado: `9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9`.

## Transformaciones de Earthbeat

`python scripts/build_globe_data.py` descarga o reutiliza las fuentes en `.tmp/globe`, verifica el archivo GEDI y genera `public/media/globe-geodata.png` sin dependencias adicionales de Python.

La textura de datos tiene 1440 × 720 píxeles: rojo identifica tierra, verde codifica metros en pasos de 0,5 m y azul indica presencia de medición. La máscara de tierra se rasteriza desde los polígonos. Los valores GEDI se muestrean en su celda original y se recortan a tierra. Los huecos permanecen como ausentes: no se interpolan ni se convierten en alturas cero. La resolución de salida no añade detalle científico.

La malla usa longitud y latitud para consultar la misma textura en toda la esfera. Las alturas medidas producen un desplazamiento radial exagerado de 0,0007 radios de esfera por metro. Las normales de iluminación se calculan desde la geometría; color y relieve comparten ubicación. La escala de color va de 0 a 70 m, y el gris indica ausencia de mediciones. La iluminación ayuda a percibir volumen y no codifica otra variable.

La generación comprueba coordenadas en Amazonia y Sahara y la máscara de tierra en Congo y Pacífico. La aplicación sirve el resultado localmente y no consulta servicios externos para animarlo.
