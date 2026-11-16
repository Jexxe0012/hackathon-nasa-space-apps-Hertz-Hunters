"""Build a coordinate-aligned globe texture from Natural Earth and GEDI.

No image or geospatial dependencies are required. Inputs are cached in .tmp/globe.
R = land mask, G = canopy height in half metres, B = measurement present.
NaN GEDI cells remain missing; they are never filled or interpolated.
"""

import hashlib
import json
import math
from pathlib import Path
import struct
import urllib.request
import zlib

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.tmp' / 'globe'
OUTPUT = ROOT / 'public' / 'media' / 'globe-geodata.png'
LAND_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson'
GEDI_URL = 'https://zenodo.org/records/5704852/files/canopy_height_2019.tif?download=1'
WIDTH, HEIGHT = 1440, 720


def source(name, url):
    path = CACHE / name
    if not path.exists():
        urllib.request.urlretrieve(url, path)
    return path.read_bytes()


def read_gedi(data):
    assert hashlib.md5(data).hexdigest() == 'c4877773e021edb121ab13883723ffcf', 'Unexpected GEDI source'
    endian = '<' if data[:2] == b'II' else '>'
    offset = struct.unpack_from(endian + 'I', data, 4)[0]
    count = struct.unpack_from(endian + 'H', data, offset)[0]
    tags = {}
    formats = {3: 'H', 4: 'I', 12: 'd'}
    for index in range(count):
        entry = offset + 2 + index * 12
        tag, kind, size, pointer = struct.unpack_from(endian + 'HHII', data, entry)
        if kind not in formats:
            continue
        fmt = endian + formats[kind] * size
        start = entry + 8 if struct.calcsize(fmt) <= 4 else pointer
        tags[tag] = struct.unpack_from(fmt, data, start)
    assert tags[256] == (720,) and tags[257] == (360,)
    assert tags[259] == (1,) and tags[258] == (32,) and tags[339] == (3,)
    assert tags[33550][:2] == (0.5, 0.5)
    assert tags[33922][3:5] == (-180.0, 90.0)
    assert 4326 in tags[34735], 'Expected WGS84 geographic coordinates'
    strips = b''.join(data[start:start + size] for start, size in zip(tags[273], tags[279]))
    return struct.unpack(endian + 'f' * (720 * 360), strips)


def land_mask(geojson):
    mask = bytearray(WIDTH * HEIGHT)
    for feature in geojson['features']:
        geometry = feature['geometry']
        polygons = [geometry['coordinates']] if geometry['type'] == 'Polygon' else geometry['coordinates']
        for polygon in polygons:
            rings = [[((lon + 180) * WIDTH / 360, (90 - lat) * HEIGHT / 180) for lon, lat in ring] for ring in polygon]
            top = max(0, math.floor(min(y for ring in rings for _, y in ring)))
            bottom = min(HEIGHT, math.ceil(max(y for ring in rings for _, y in ring)))
            for row in range(top, bottom):
                scan = row + 0.5
                crossings = []
                for ring in rings:
                    for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
                        if (y1 <= scan < y2) or (y2 <= scan < y1):
                            crossings.append(x1 + (scan - y1) * (x2 - x1) / (y2 - y1))
                crossings.sort()
                for left, right in zip(crossings[::2], crossings[1::2]):
                    start = max(0, math.ceil(left - 0.5))
                    end = min(WIDTH, math.ceil(right - 0.5))
                    mask[row * WIDTH + start:row * WIDTH + end] = b'\xff' * (end - start)
    return mask


def png_chunk(kind, data):
    return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    raw_gedi = source('canopy_height_2019.tif', GEDI_URL)
    raw_land = source('ne_110m_land.geojson', LAND_URL)
    assert hashlib.sha256(raw_land).hexdigest() == '9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9', 'Unexpected Natural Earth source'
    values = read_gedi(raw_gedi)
    land = land_mask(json.loads(raw_land))
    # Check georeferencing against known geographic locations before shipping.
    assert 27 < values[190 * 720 + 240] < 28  # Amazon: 60 W, 5 S
    assert math.isnan(values[130 * 720 + 390])  # Sahara: 15 E, 25 N
    assert land[360 * WIDTH + 800]  # Congo: 20 E, 0 N
    assert not land[360 * WIDTH + 120]  # Pacific: 150 W, 0 N
    rows = bytearray()
    for y in range(HEIGHT):
        rows.append(0)
        for x in range(WIDTH):
            value = values[(y // 2) * 720 + x // 2]
            present = bool(land[y * WIDTH + x]) and math.isfinite(value) and value >= 0
            rows.extend((land[y * WIDTH + x], round(value * 2) if present else 0, 255 if present else 0, 255))
    header = struct.pack('>IIBBBBB', WIDTH, HEIGHT, 8, 6, 0, 0, 0)
    OUTPUT.write_bytes(b'\x89PNG\r\n\x1a\n' + png_chunk(b'IHDR', header) + png_chunk(b'IDAT', zlib.compress(rows, 9)) + png_chunk(b'IEND', b''))
    print(json.dumps({'output': str(OUTPUT), 'bytes': OUTPUT.stat().st_size, 'gedi_sha256': hashlib.sha256(raw_gedi).hexdigest(), 'land_sha256': hashlib.sha256(raw_land).hexdigest(), 'measured_cells': sum(math.isfinite(v) and v >= 0 for v in values)}, indent=2))


if __name__ == '__main__':
    main()
