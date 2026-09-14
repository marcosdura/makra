# Códigos de descripción — MÄKRA

Referencia para decodificar los nombres de archivo de Google Drive y armar la descripción de cada pieza en el sitio. La numeración `01, 02, 03...` corresponde al orden alfabético de los archivos `IMG_XXXX` dentro de cada carpeta, que es el mismo orden en que se guardaron las fotos en `assets/collares/<coleccion>/`.

## Leyenda de piedras

| Código | Piedra |
|---|---|
| OT / jas.ot | Ojo de tigre / Jaspe ojo de tigre |
| lap | Lapislázuli |
| jasp dra | Jaspe dragón |
| aven.ver | Aventurina verde |
| gran | Granate |
| onix.cie | Ónix cielo |
| jas.mook | Jaspe mookaite |
| mal ver | Malaquita verde |
| turq tibe | Turquesa tibetana |
| lab / labra | Labradorita |
| rod | Rodocrosita |
| lab.azul | Labradorita azul |
| ama | Amatista |
| obs.dor | Obsidiana dorada |
| onix.bla | Ónix blanco |
| obsi | Obsidiana |
| trini | Trinita |
| ama.mex | Amatista mexicana |

`most.` = mostacillas (doradas / plateadas = tono del abalorio). `null` = ese campo no aplica en esa pieza.

## Formato por colección

| Colección | Formato del nombre de archivo |
|---|---|
| Modelo Frey | Tipo de piedra - Color de hilo - Detalles |
| Collares de piedras | Tipo de piedra - ¿Dije? (Si/No) - Detalles |
| Modelo Hila | Tipo de piedra - Color de hilo - Detalles |
| Modelo Lüm | Tipo de piedra - Color de hilo - Detalles |
| Modelo Trama | Tipo de piedra - Color de hilo - Detalles |
| Joyería | Descripción genérica — material bronce (sin código por pieza) |
| Pulseras (ex "Modelos varios Pulseras") | Tipo (piedra/macra) - Tipo de piedra - Color de piedra - Detalles |
| Modelo Cumbre (ex "Varios modelos") | Tipo de piedra - Color de hilo - Detalles |

## Cómo se escribe la descripción en el sitio

- **Collares de macramé** (Frey, Hila, Lüm, Trama, Cumbre): `Collar de macramé con piedra <piedra>, hilo color <hilo> y mostacillas <tono>.`
  - Sin mostacillas: `Collar de macramé con piedra <piedra> e hilo color <hilo>.`
  - Sin piedra: `Collar de macramé con hilo color <hilo> y mostacillas <tono>.`
  - En `index.html` lo arma el helper `macrame(piedra, hilo, mostacillas)`; pasar `null` en lo que no aplique.
- **Collares de piedras**: `<Piedra>, con dije, mostacillas <tono>.` — si no tiene dije, no se menciona: `<Piedra>, mostacillas <tono>.`
- **Pulseras**: texto propio por pieza. **Joyería**: descripción genérica de la colección.
- Solo fotos de **una pieza por foto**: las fotos grupales (varios collares juntos) no van en el catálogo.

## Decodificación por pieza

### Modelo Frey (`modelo-frey`)
| # | Archivo | Piedra | Hilo | Detalle |
|---|---|---|---|---|
| 01 | IMG_0006 | Labradorita | Marrón chocolate | Mostacillas doradas |
| 02 | IMG_9937 | Malaquita verde | Marrón chocolate | Mostacillas doradas |
| 03 | IMG_9938 | Ónix cielo | Marrón chocolate | Mostacillas plateadas |

### Joyería (`joyeria`)
8 piezas, descripción genérica (material: bronce), sin código individual. Precio por pieza.

| # | Archivo | Precio |
|---|---|---|
| 01 | IMG_0001 | $26.000 |
| 02 | IMG_0004 | $45.000 |
| 03 | IMG_9984 | $55.000 |
| 04 | IMG_9986 | $37.000 |
| 05 | IMG_9987 | $48.000 |
| 06 | IMG_9990 | $15.000 |
| 07 | IMG_9991 | $33.000 |
| 08 | IMG_9998 | $60.000 |

### Modelo Hila (`modelo-hila`)
| # | Archivo | Piedra | Hilo | Detalle |
|---|---|---|---|---|
| 01 | IMG_9925 | Malaquita | Marrón chocolate | Mostacillas doradas |
| 02 | IMG_9926 | Ojo de tigre | Marrón chocolate | — |
| 03 | IMG_9927 | Rodocrosita | Marrón chocolate | — |
| 04 | IMG_9928 | Labradorita azul | Marrón chocolate | Mostacillas plateadas |
| 05 | IMG_9929 | Amatista | Marrón chocolate | Mostacillas plateadas |
| 06 | IMG_9930 | Malaquita verde | Marrón | Mostacillas doradas |
| 07 | IMG_9931 | Malaquita | Marrón | Mostacillas doradas |
| 08 | IMG_9932 | Ónix blanco | Verde | Mostacillas doradas |
| 09 | IMG_9933 | Obsidiana | Verde | — |
| 10 | IMG_9934 | Obsidiana dorada | Negro | Mostacillas plateadas |
| 11 | IMG_9935 | Malaquita verde | Crema | Mostacillas doradas |

### Pulseras (`pulseras`, ex "Modelos varios Pulseras")
| # | Archivo | Tipo | Piedra | Color | Detalle |
|---|---|---|---|---|---|
| 01 | IMG_9877 | Piedra ensartada | Jaspe mookaite | — | Mostacillas plateadas |
| 02 | IMG_9878 | Piedra ensartada | Rodocrosita | — | Mostacillas plateadas |
| 03 | IMG_9879 | Piedra ensartada | Jaspe ojo de tigre | — | Mostacillas doradas |
| 04 | IMG_9943 | Macramé | — | Gris | Mostacillas plateadas |
| 05 | IMG_9944 | Macramé | — | Marrón chocolate | Mostacillas plateadas |
| 06 | IMG_9945 | Macramé | Amatista | Negro | — |
| 07 | IMG_9946 | Macramé | Labradorita | Gris | — |
| 08 | IMG_9947 | Macramé | — | Marrón chocolate | Mostacillas doradas |
| 09 | IMG_9949 | Macramé | Ónix cielo | Marrón | — |

### Modelo Lüm (`modelo-lum`)
| # | Archivo | Piedra | Hilo | Detalle |
|---|---|---|---|---|
| 01 | IMG_9902 | Ónix cielo | Marrón chocolate | Mostacillas doradas |
| 02 | IMG_9903 | Malaquita verde | Marrón chocolate | Mostacillas doradas |
| 03 | IMG_9904 | Ónix blanco | Verde | Mostacillas doradas |
| 04 | IMG_9905 | Ojo de tigre | Marrón | Mostacillas doradas |
| 05 | IMG_9906 | Malaquita | Marrón | Mostacillas plateadas |
| 06 | IMG_9907 | Rodocrosita | Negro | Mostacillas plateadas |
| 07 | IMG_9913 | Labradorita | Marrón chocolate | Mostacillas doradas |

IMG_9908 era una foto grupal (6 collares juntos): se sacó del catálogo.

### Modelo Trama (`modelo-trama`)
| # | Archivo | Piedra | Hilo | Detalle |
|---|---|---|---|---|
| 01 | IMG_9914 | — | Marrón | Mostacillas doradas |
| 02 | IMG_9915 | Cuarzo lechoso | Marrón | Mostacillas doradas |
| 03 | IMG_9916 | — | Marrón chocolate | Mostacillas doradas |
| 04 | IMG_9917 | Malaquita | Marrón | — |
| 05 | IMG_9918 | Trinita | Marrón | Mostacillas doradas |
| 06 | IMG_9919 | Malaquita verde | Marrón chocolate | Mostacillas doradas |
| 07 | IMG_9921 | Ónix blanco | Verde | Mostacillas doradas |
| 08 | IMG_9922 | Obsidiana | Negro | — |
| 09 | IMG_9923 | Amatista | Marrón violetoso | Mostacillas plateadas |
| 10 | IMG_9924 | Amatista mexicana | Marrón chocolate | Mostacillas plateadas |

### Collares de piedras (`collares-de-piedras`)
| # | Archivo | Piedra | ¿Dije? | Detalle |
|---|---|---|---|---|
| 01 | IMG_9881 | Ojo de tigre | Sí | Mostacillas doradas |
| 02 | IMG_9883 | Lapislázuli | No | Mostacillas plateadas |
| 03 | IMG_9884 | Jaspe dragón | No | Mostacillas doradas |
| 04 | IMG_9886 | Jaspe dragón y ojo de tigre | Sí | Mostacillas doradas |
| 05 | IMG_9888 | Aventurina verde | No | Mostacillas plateadas |
| 06 | IMG_9890 | Granate | No | Mostacillas doradas |
| 07 | IMG_9892 | Ónix cielo | No | Mostacillas plateadas |
| 08 | IMG_9894 | Ojo de tigre | No | Mostacillas doradas |
| 09 | IMG_9898 | Jaspe mookaite | No | Mostacillas plateadas |

IMG_9896 (5 collares juntos) e IMG_9900 (3 collares juntos) eran fotos grupales: se sacaron del catálogo.

### Modelo Cumbre (`modelo-cumbre`, ex "Varios modelos")
Carpeta de Drive renombrada; ahora solo tiene estas 3 piezas (se sacaron del sitio las otras 7 fotos que tenía la vieja colección "Varios modelos": IMG_9870, 9872, 9873, 9874, 9876, 9948, 9950).

| # | Archivo | Piedra | Hilo | Detalle |
|---|---|---|---|---|
| 01 | IMG_9939 | Malaquita verde | Marrón chocolate | Mostacillas doradas |
| 02 | IMG_9940 | Ojo de tigre | Marrón chocolate | Mostacillas doradas |
| 03 | IMG_9941 | Turquesa tibetana | Negro | Mostacillas doradas |
