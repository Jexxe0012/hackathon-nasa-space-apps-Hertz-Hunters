"""Regenera las pistas MP3 desde public/media/*.webp con Pillow y FFmpeg.

Uso: python scripts/sonify.py [--ffmpeg /ruta/a/ffmpeg]
Cada archivo contiene 96 notas de medio segundo, correspondientes a 96 franjas.
"""

import argparse
from array import array
from functools import cache
import math
from pathlib import Path
import subprocess
import sys

from PIL import Image, ImageStat

MEDIA = Path(__file__).resolve().parents[1] / "public" / "media"
STRIPS = 96
RATE = 24000
SAMPLES_PER_NOTE = RATE // 2
SEMITONES = (0, 2, 4, 7, 9, 12, 14, 16, 19, 21)


@cache
def note(level: int) -> bytes:
    frequency = 174.61 * 2 ** (SEMITONES[level] / 12)
    samples = array("h")
    for index in range(SAMPLES_PER_NOTE):
        time = index / RATE
        angle = 2 * math.pi * frequency * time
        envelope = min(1, time / 0.018) * math.exp(-3.8 * time)
        envelope *= min(1, (SAMPLES_PER_NOTE - 1 - index) / (RATE * 0.04))
        wave = math.sin(angle) + 0.17 * math.sin(2 * angle) + 0.05 * math.sin(3 * angle)
        samples.append(round(9200 * envelope * wave))
    if sys.byteorder == "big":
        samples.byteswap()
    return samples.tobytes()


def sonify(path: Path, ffmpeg: str) -> None:
    with Image.open(path) as image:
        gray = image.convert("L")
        means = []
        for strip in range(STRIPS):
            left = strip * gray.width // STRIPS
            right = (strip + 1) * gray.width // STRIPS
            band = gray.crop((left, 0, right, gray.height))
            means.append(ImageStat.Stat(band).mean[0])

    low, high = min(means), max(means)
    spread = high - low
    levels = [round((v - low) / spread * (len(SEMITONES) - 1)) if spread else 0 for v in means]
    pcm = b"".join(note(level) for level in levels)
    output = path.with_suffix(".mp3")
    temp = output.with_suffix(".tmp.mp3")
    try:
        subprocess.run(
            [ffmpeg, "-v", "error", "-y", "-f", "s16le", "-ar", str(RATE),
             "-ac", "1", "-i", "pipe:0", "-c:a", "libmp3lame", "-b:a", "48k", str(temp)],
            input=pcm,
            check=True,
        )
        temp.replace(output)
    finally:
        temp.unlink(missing_ok=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", default="ffmpeg")
    args = parser.parse_args()
    for path in sorted(MEDIA.glob("*.webp")):
        sonify(path, args.ffmpeg)
