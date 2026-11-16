"""Lee la temperatura del mar por zonas en los 48 mapas semanales del SVS 3912 (ECCO2).

Uso:
    python leer_zonas.py [carpeta_3912_oceano]

La carpeta debe tener: global_semanal/*.png, barra_0a32C.png, indice_semanal.csv.
Por defecto usa la carpeta de contexto de Diego en el escritorio.

Método (color -> °C):
  1. De la barra de color se toma el TONO (hue) de cada columna: baja ordenado de ~228° (0 °C)
     a ~354° (32 °C). Para que sea una sola subida continua, los tonos > 300° se cuentan como negativos.
  2. En cada mapa solo cuentan los pixeles de las líneas de corriente (croma max−min > 0.15 y brillo > 0.25).
     El fondo negro y la tierra gris quedan fuera.
  3. El tono de cada pixel se convierte a °C interpolando contra la barra.
  4. La temperatura de una zona es la MEDIANA de sus pixeles de línea. También se guarda cuántos pixeles
     hubo y el rango intercuartil (qué tan dispersos estaban). Sin suavizado entre semanas.
"""
import csv
import glob
import json
import os
import sys

import numpy as np
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
CARPETA = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\ADMIN\Desktop\NASA-SpaceApps-2026-EarthJukebox\05-assets\3912_oceano"
W, H = 2048, 1024
KM_POR_PX = 111.32 * 360 / W  # ~19.6 km en el ecuador (en lon a 13°N es ~19.1 km)
MIN_PIXELES = 8               # menos de esto: la semana/zona se marca como "no se lee bien"

S_MIN, V_MIN = 0.15, 0.25  # croma (max-min) y brillo; probado: mismo valor que el filtro estricto (±0.2 °C) y más semanas leídas


def hue_sv(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = np.where(mx - mn == 0, 1e-9, mx - mn)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    h = np.where(h > 300, h - 360, h)
    return h, mx - mn, mx


def leer_barra(ruta):
    cb = np.asarray(Image.open(ruta).convert("RGB")).astype(float) / 255
    _, s, _ = hue_sv(cb)
    filas = np.where((s > 0.5).sum(1) > cb.shape[1] * 0.5)[0]
    fila = cb[(filas.min() + filas.max()) // 2]
    _, sf, _ = hue_sv(fila)
    cols = np.where(sf > 0.5)[0]
    fila = fila[cols.min():cols.max() + 1]
    h, _, _ = hue_sv(fila)
    t = np.linspace(0, 32, len(h))
    orden = np.argsort(h)
    return h[orden], t[orden], h, t


def x_de(lon):
    return int(np.floor((lon + 180) / 360 * W))


def y_de(lat):
    return int(np.floor((90 - lat) / 180 * H))


def lat_de(y):
    return 90 - (y + 0.5) * 180 / H


def main():
    hb, tb, h_barra, t_barra = leer_barra(os.path.join(CARPETA, "barra_0a32C.png"))

    # Control 1: la barra leída contra sí misma (debe dar casi 0 de error)
    t_ida = np.interp(h_barra, hb, tb)
    err_barra = float(np.abs(t_ida - t_barra).max())
    # Sensibilidad: cuántos grados de tono hay por °C en cada tramo (si es bajo, la lectura es más gruesa)
    sens = {f"{a}-{a + 2} C": round(float(abs(np.interp(a + 2, t_barra, h_barra) - np.interp(a, t_barra, h_barra)) / 2), 1)
            for a in range(22, 32, 2)}

    indice = list(csv.DictReader(open(os.path.join(CARPETA, "indice_semanal.csv"), encoding="utf-8")))
    archivos = sorted(glob.glob(os.path.join(CARPETA, "global_semanal", "*.png")))
    assert len(archivos) == len(indice) == 48, (len(archivos), len(indice))

    imgs = [np.asarray(Image.open(f).convert("RGB")).astype(float) / 255 for f in archivos]

    # Tierra: gris (poca saturación) en cualquiera de las semanas
    tierra = np.zeros((H, W), bool)
    for im in imgs[::4]:
        _, s, v = hue_sv(im)
        tierra |= (s < 0.08) & (v > 0.15)

    # Costa de El Salvador: por cada columna, primera fila de mar al sur de la tierra
    def costa(x):
        y = y_de(14.6)
        while not tierra[y, x]:
            y += 1
        while tierra[y, x]:
            y += 1
        return y  # primera fila sin tierra

    FILAS_SALTO = 1   # la primera fila pegada a la costa casi no tiene líneas: se salta
    FILAS_ZONA = 8    # ~20 a ~176 km mar adentro (con 6 filas faltaban demasiadas semanas)
    zonas_costa = {
        "oeste_acajutla": ("Oeste: frente a Acajutla", "West: off Acajutla", -90.15, -89.45),
        "centro_la_libertad": ("Centro: frente a La Libertad / Surf City", "Center: off La Libertad / Surf City", -89.45, -88.60),
        "este_el_cuco_fonseca": ("Este: frente a El Cuco / Golfo de Fonseca", "East: off El Cuco / Gulf of Fonseca", -88.60, -87.70),
    }
    mascaras = {}
    meta = {}
    for clave, (es, en, lon0, lon1) in zonas_costa.items():
        m = np.zeros((H, W), bool)
        ys_costa = []
        for x in range(x_de(lon0), x_de(lon1)):
            yc = costa(x)
            ys_costa.append(yc)
            m[yc + FILAS_SALTO: yc + FILAS_SALTO + FILAS_ZONA, x] = True
        m &= ~tierra
        mascaras[clave] = m
        meta[clave] = {
            "nombre_es": es, "nombre_en": en, "tipo": "costa_el_salvador",
            "lon": [lon0, lon1],
            "lat_costa_aprox": round(float(np.mean([lat_de(y) for y in ys_costa])), 2),
            "km_mar_adentro": [round(FILAS_SALTO * KM_POR_PX), round((FILAS_SALTO + FILAS_ZONA) * KM_POR_PX)],
            "pixeles_zona": int(m.sum()),
        }

    comparacion = {
        "lengua_fria_ecuatorial": ("Lengua fría del Pacífico ecuatorial", "Equatorial Pacific cold tongue", -110.0, -95.0, -2.0, 2.0),
        "caribe": ("Mar Caribe (centro)", "Caribbean Sea (central)", -80.0, -72.0, 13.0, 17.0),
    }
    for clave, (es, en, lon0, lon1, lat0, lat1) in comparacion.items():
        m = np.zeros((H, W), bool)
        m[y_de(lat1):y_de(lat0), x_de(lon0):x_de(lon1)] = True
        m &= ~tierra
        mascaras[clave] = m
        meta[clave] = {"nombre_es": es, "nombre_en": en, "tipo": "comparacion",
                       "lon": [lon0, lon1], "lat": [lat0, lat1], "pixeles_zona": int(m.sum())}

    registros = []
    fuera_de_barra = {k: 0 for k in mascaras}
    for fila, im in zip(indice, imgs):
        h, s, v = hue_sv(im)
        linea = (s > S_MIN) & (v > V_MIN)
        en_rango = (h >= hb.min() - 3) & (h <= hb.max() + 3)
        T = np.interp(h, hb, tb)
        for clave, m in mascaras.items():
            sel = m & linea
            fuera_de_barra[clave] += int((sel & ~en_rango).sum())
            vals = T[sel & en_rango]
            n = int(vals.size)
            ok = n >= MIN_PIXELES
            registros.append({
                "semana": int(fila["semana"]),
                "fecha": fila["fecha"],
                "fecha_hora_utc": fila["fecha_hora_utc"],
                "zona": clave,
                "temperatura_c": round(float(np.median(vals)), 2) if ok else None,
                "pixeles_leidos": n,
                "rango_intercuartil_c": round(float(np.subtract(*np.percentile(vals, [75, 25]))), 2) if ok else None,
                "se_lee_bien": ok,
            })

    salida = {
        "fuente": "NASA SVS 3912 · ECCO2 (simulación), mapa global 2048x1024, 48 frames (1 por semana)",
        "aviso_es": "Es UNA simulación de un año (mar 2007 – feb 2008): muestra el ciclo de las estaciones, no una tendencia de calentamiento.",
        "aviso_en": "This is ONE simulated year (Mar 2007 – Feb 2008): it shows the seasonal cycle, not a warming trend.",
        "metodo": "tono del color -> °C contra la barra 0–32 °C; mediana de los pixeles de línea por zona; sin suavizar",
        "km_por_pixel": round(KM_POR_PX, 1),
        "control_barra_error_max_c": round(err_barra, 3),
        "sensibilidad_grados_de_tono_por_c": sens,
        "umbral_huracanes_c": 26.5,
        "zonas": meta,
        "pixeles_fuera_de_la_barra": fuera_de_barra,
        "registros": registros,
    }
    out = os.path.join(AQUI, "resultados", "oceano_3912_zonas.json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump(salida, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("escrito", out)


if __name__ == "__main__":
    main()
