"""Une las 3 zonas de la costa salvadoreña en una sola zona "costa" y guarda costa + Caribe.

Uso: python costa.py   (después de leer_zonas.py; solo usa la biblioteca estándar)
Lee      resultados/oceano_3912_zonas.json  (no lo modifica)
Escribe  resultados/oceano_3912_costa.json  (el que carga el motor de sonido)

Regla: por semana, la temperatura de la costa es la MEDIANA de las zonas (oeste, centro, este)
que tengan lectura esa semana. Con 2 zonas, la mediana es el promedio de las dos; con 1, su valor.
Si ninguna zona tiene lectura, la semana queda en null: no se rellena ni se interpola.
"""
import json
import os
import statistics

AQUI = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(AQUI, "resultados")
COSTA = ["oeste_acajutla", "centro_la_libertad", "este_el_cuco_fonseca"]

j = json.load(open(os.path.join(R, "oceano_3912_zonas.json"), encoding="utf-8"))
UMBRAL = j["umbral_huracanes_c"]

por_semana = {}
for r in j["registros"]:
    s = por_semana.setdefault(r["semana"], {"fecha": r["fecha"], "zonas": {}})
    s["zonas"][r["zona"]] = r["temperatura_c"]

costa, caribe = [], []
for semana in sorted(por_semana):
    d = por_semana[semana]
    vals = [d["zonas"][z] for z in COSTA if d["zonas"].get(z) is not None]
    costa.append({
        "semana": semana,
        "fecha": d["fecha"],
        "temperatura_c": round(statistics.median(vals), 2) if vals else None,
        "zonas_con_lectura": len(vals),
    })
    caribe.append({"semana": semana, "fecha": d["fecha"], "temperatura_c": d["zonas"].get("caribe")})


def resumen(serie):
    ok = [x for x in serie if x["temperatura_c"] is not None]
    mn = min(ok, key=lambda x: x["temperatura_c"])
    mx = max(ok, key=lambda x: x["temperatura_c"])
    return {
        "semanas_con_dato": len(ok),
        "semanas_sin_dato": [x["semana"] for x in serie if x["temperatura_c"] is None],
        "min_c": mn["temperatura_c"], "fecha_min": mn["fecha"],
        "max_c": mx["temperatura_c"], "fecha_max": mx["fecha"],
        "semanas_bajo_umbral": [x["semana"] for x in ok if x["temperatura_c"] < UMBRAL],
    }


z = j["zonas"]
salida = {
    "fuente": j["fuente"],
    "aviso_es": j["aviso_es"],
    "aviso_en": j["aviso_en"],
    "metodo_costa": "Mediana por semana de las zonas oeste (Acajutla), centro (La Libertad / Surf City) y este "
                    "(El Cuco / Golfo de Fonseca) que tengan lectura; si ninguna tiene, null. Sin suavizar ni rellenar.",
    "umbral_huracanes_c": UMBRAL,
    "error_lectura_max_c": round(j["control_barra_error_max_c"], 2),
    "zonas": {
        "costa": {
            "nombre_es": "frente a Surf City · costa salvadoreña",
            "nombre_en": "off Surf City · El Salvador's coast",
            "detalle_es": "Franja de mar de ~%d a ~%d km mar adentro, de Acajutla al Golfo de Fonseca" % tuple(
                z["oeste_acajutla"]["km_mar_adentro"]),
            "detalle_en": "Sea strip ~%d to ~%d km offshore, from Acajutla to the Gulf of Fonseca" % tuple(
                z["oeste_acajutla"]["km_mar_adentro"]),
            "lon": [z["oeste_acajutla"]["lon"][0], z["este_el_cuco_fonseca"]["lon"][1]],
            "zonas_unidas": COSTA,
            **resumen(costa),
        },
        "caribe": {
            "nombre_es": z["caribe"]["nombre_es"] + " · para comparar",
            "nombre_en": z["caribe"]["nombre_en"] + " · for comparison",
            "lon": z["caribe"]["lon"], "lat": z["caribe"]["lat"],
            **resumen(caribe),
        },
    },
    "series": {"costa": costa, "caribe": caribe},
}

out = os.path.join(R, "oceano_3912_costa.json")
json.dump(salida, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

c = salida["zonas"]["costa"]
cuantas = {n: sum(1 for x in costa if x["zonas_con_lectura"] == n) for n in (3, 2, 1, 0)}
print("escrito", out)
print("costa: semanas con dato %d de %d · sin dato: %s" % (c["semanas_con_dato"], len(costa), c["semanas_sin_dato"] or "ninguna"))
print("semanas según cuántas zonas tenían lectura:", cuantas)
print("min %.2f (%s) · max %.2f (%s) · bajo %.1f: %s" % (c["min_c"], c["fecha_min"], c["max_c"], c["fecha_max"], UMBRAL, c["semanas_bajo_umbral"]))
