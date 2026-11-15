"""Resume resultados/oceano_3912_zonas.json: mínimos/máximos, umbral 26,5 °C, diferencias entre zonas y gráfica.

Uso: python analizar.py   (después de leer_zonas.py)
Escribe resultados/resumen.json y resultados/oceano_3912_zonas.png
"""
import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(AQUI, "resultados")
j = json.load(open(os.path.join(R, "oceano_3912_zonas.json"), encoding="utf-8"))
UMBRAL = j["umbral_huracanes_c"]
zonas = list(j["zonas"])
costa = [z for z in zonas if j["zonas"][z]["tipo"] == "costa_el_salvador"]

serie = {z: {} for z in zonas}
fechas = {}
for r in j["registros"]:
    fechas[r["semana"]] = r["fecha"]
    serie[r["zona"]][r["semana"]] = r["temperatura_c"]
semanas = sorted(fechas)

resumen = {"zonas": {}, "umbral_c": UMBRAL}
for z in zonas:
    ok = {s: t for s, t in serie[z].items() if t is not None}
    smin = min(ok, key=ok.get)
    smax = max(ok, key=ok.get)
    bajo = [s for s in semanas if ok.get(s) is not None and ok[s] < UMBRAL]
    resumen["zonas"][z] = {
        "semanas_leidas": len(ok),
        "semanas_sin_lectura": [s for s in semanas if s not in ok],
        "min_c": ok[smin], "semana_min": smin, "fecha_min": fechas[smin],
        "max_c": ok[smax], "semana_max": smax, "fecha_max": fechas[smax],
        "semanas_bajo_umbral": bajo,
        "fechas_bajo_umbral": [fechas[s] for s in bajo],
    }

# ¿Se distinguen las 3 zonas de la costa? Diferencias semana a semana donde ambas se leen
pares = {}
for i, a in enumerate(costa):
    for b in costa[i + 1:]:
        d = [serie[a][s] - serie[b][s] for s in semanas if serie[a].get(s) is not None and serie[b].get(s) is not None]
        d = np.array(d)
        pares[f"{a} - {b}"] = {
            "semanas_comparadas": int(d.size),
            "diferencia_media_c": round(float(d.mean()), 2),
            "diferencia_absoluta_media_c": round(float(np.abs(d).mean()), 2),
            "diferencia_absoluta_max_c": round(float(np.abs(d).max()), 2),
            "semanas_con_diferencia_mayor_a_0_5c": int((np.abs(d) > 0.5).sum()),
        }
resumen["diferencias_entre_zonas_de_costa"] = pares
iqr = [r["rango_intercuartil_c"] for r in j["registros"] if r["zona"] in costa and r["rango_intercuartil_c"] is not None]
resumen["dispersion_tipica_dentro_de_una_zona_c"] = round(float(np.median(iqr)), 2)
json.dump(resumen, open(os.path.join(R, "resumen.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# Gráfica
colores = {"oeste_acajutla": "#1f77b4", "centro_la_libertad": "#2ca02c", "este_el_cuco_fonseca": "#9467bd",
           "lengua_fria_ecuatorial": "#17becf", "caribe": "#ff7f0e"}
fig, ax = plt.subplots(figsize=(11, 5.5), dpi=120)
for z in zonas:
    ys = [serie[z].get(s) for s in semanas]
    ys = [np.nan if v is None else v for v in ys]
    estilo = "-" if z in costa else "--"
    ax.plot(semanas, ys, estilo, marker="o", ms=3, lw=1.6, color=colores[z], label=j["zonas"][z]["nombre_es"])
ax.axhline(UMBRAL, color="crimson", lw=1, ls=":")
ax.text(semanas[0], UMBRAL + 0.1, "26,5 °C · umbral que favorece la formación de huracanes", color="crimson", fontsize=8)
ticks = semanas[::4]
ax.set_xticks(ticks)
ax.set_xticklabels([fechas[s] for s in ticks], rotation=45, ha="right", fontsize=8)
ax.set_ylabel("Temperatura del mar (°C)")
ax.set_title("Mar frente a El Salvador · un año simulado (ECCO2, mar 2007 – feb 2008) · NASA SVS 3912\n"
             "Ciclo de las estaciones, no tendencia · huecos = semanas sin suficientes líneas para leer", fontsize=10)
ax.grid(alpha=0.3)
ax.legend(fontsize=8, loc="lower left")
fig.tight_layout()
fig.savefig(os.path.join(R, "oceano_3912_zonas.png"))
print(json.dumps(resumen, ensure_ascii=False, indent=1))
