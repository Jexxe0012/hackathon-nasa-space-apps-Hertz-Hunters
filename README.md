# Earthbeat

[Español](docs/README.es.md)

A Hertz Hunters project for the NASA Space Apps Challenge.

Earthbeat turns four NASA Earth visualizations into stories you can explore through sound, clear descriptions, and keyboard controls. Designed primarily for blind and low-vision people, it starts with a guided experience and also offers a visual collection and interactive maps. The **Enfoque** design is implemented with React, TypeScript, and Vite, with restrained pixel art details and playback controls at the bottom. [Enfoque design in Figma](https://www.figma.com/design/4q6sU5VYc8qZHcr2rmdSLO?node-id=6-11720)

Each track has a background inspired by its subject. High contrast uses a clean background, and reduced motion removes decorative animation.

## Run locally

Use Node.js 22.12 or later and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the address printed by Vite. To build and preview production:

```sh
npm run build
npm run preview
```

Images, fonts, sample MP3 files, and sound scenes are served by the project. The scenes load Tone.js and piano samples from the web. No API key is required. Python, Pillow, and FFmpeg are only needed to regenerate sample MP3 files with `python scripts/sonify.py`.

## Language and accessibility

**English is the default**, even when the browser or device uses Spanish. Choose **Español** in the Language selector to use Spanish. The selector is available in both experiences and remembers the choice in `earthbeat.language`. It updates the interface, stories, descriptions, sound scenes, accessible labels, announcements, and optional narration together.

On a first visit, the **guided experience** lets you choose your own screen reader or optional Earthbeat narration. It takes you through choosing a story, understanding its context, listening, and reviewing what the data can tell you. **Visual experience** opens the collection and globe; **Guided experience** takes you back. The preferred experience is remembered separately from the language.

Earthbeat sets the page and scene language to English or Spanish for screen readers. TalkBack is enabled in Android settings; the website cannot activate it or change its system voice. Automatic language switching in a screen reader depends on its settings and installed voices. Earthbeat's optional narration requests `en-US` by default and `es-ES` in Spanish, using an available voice in the chosen language. Narration starts only after a user action, can be stopped or repeated, and pauses when you operate a sound scene. [Guided experience and validation limits](docs/guided-experience.md)

After starting the guide, right-click in the reading area to move forward and left-click to go back. Buttons, links, preferences, and scene controls keep their native behavior. Click navigation can be disabled. Optional pointer reading waits until the pointer rests over text. **Previous** and **Next** offer keyboard and touch alternatives. Every task can be completed without moving the mouse.

The player appears only inside a sound experience: on an open track in the visual experience, or during the listening step in the guide. Its controls and skip link disappear when you return to home or the collection.

Use **Tab** and **Shift + Tab** to move between controls. Use **Enter** or **Space** to activate buttons, and the arrow keys, **Home**, and **End** on sliders. Accessibility settings remember contrast and motion preferences.

## Listen to an image

Choose a story from the collection. **About this track** explains its period, variable, source, and interpretation limits. **Sound guide** explains how the data maps to sound.

The opening night-lights story asks, “What did the world's night lights sound like during the pandemic?” It prepares the 2020 average and offers a **2019 → 2020** comparison. You can change both years. Playback starts only when you press Play or Compare. Annual maps alone cannot attribute a difference to the pandemic or describe a particular day of lockdown.

| Track | What you hear |
| --- | --- |
| Currents and temperature | A year off El Salvador's coast, represented by waves and piano. Higher notes mean warmer water; foam appears above 27 °C. |
| Night lights | A scan of annual night-light maps from 2012 to 2023. Where there is light, the piano plays. Choose two years to compare. |
| Aerosols | Stories from August 19, 2025, with an instrument for each particle type: dust, sea salt, sulfates, and black carbon. |
| Forest height | A journey from the heart of the Amazon to its forest edge. The piano climbs a tree at each point. |

Each track embeds Diego Fuentes's sound scene from `public/sonido/`, using data extracted from NASA images in `public/sonido/datos/`. Regeneration scripts live in `imagen-a-sonido/`. The bottom player controls playback, position, and volume through the scene bridge. Standalone scenes such as `sonido/oceano/` also offer WAV export.

The design principle is that emotion follows the data: if the data does not change, the sound does not change. Each track explains the limits of its source, including single-year models, annual averages, and approximate heights.

The welcome globe combines Natural Earth cartography with estimated GEDI canopy heights from April–July 2019, published by Lang and colleagues. Both layers use WGS84 coordinates. Relief is exaggerated and areas without measurements appear gray. Rotation can be paused and stops with reduced motion. [Globe data, attribution, and processing (Spanish)](docs/globo-datos.md)

## Sources and credits

| Track | Original resources |
| --- | --- |
| Currents and temperature | [NASA SVS 3912](https://svs.gsfc.nasa.gov/3912/) · [Pacific cover](public/sonido/oceano/mapas/s01.webp) |
| Forest height | [NASA SVS 4950](https://svs.gsfc.nasa.gov/4950/) · [Americas cover](public/sonido/bosques/globo.webp) |
| Aerosols | [NASA SVS 5669](https://svs.gsfc.nasa.gov/5669/) · [Source image](https://svs.gsfc.nasa.gov/vis/a000000/a005600/a005669/Aerosols_2025-08-19T20_00_00_1920x1080.png) |
| Night lights | [NASA SVS 5276, 2012–2023 series](https://svs.gsfc.nasa.gov/5276/) · [2020 cover](public/sonido/luces/mapas/mundo_2020.webp) |

The catalog is in [src/data.ts](src/data.ts), the English-to-Spanish messages in [src/messages.ts](src/messages.ts), and language selection in [src/i18n.tsx](src/i18n.tsx). Font licenses are in [public/licenses](public/licenses). The sample audio generator is [scripts/sonify.py](scripts/sonify.py).

## Validation

```sh
npm run test:localization
npm run build
```

Localization tests check message coverage, placeholders, dataset identity and translations, narration language selection, and the standalone scene language preference. Real-device testing with TalkBack, NVDA/VoiceOver, and blind users is still required before claiming verified screen-reader compatibility.

## Team workflow

Josué works on design and the accessible interface. Diego Fuentes develops the sound engines, and Diego works on the guide bot. The backend is assigned to the corresponding team member. Interface narration reads existing content; it is separate from the conversational bot.

Group changes by task on working branches. Use commit messages such as `feat(datos)`, `feat(reproductor)`, `fix(accesibilidad)`, and `docs(readme)`. Update this README when a task changes what the app does or how to run it.
