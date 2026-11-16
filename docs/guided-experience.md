# Earthbeat guided experience

The guided experience is the first-visit entry point. The visual experience remains available; the preferred experience is stored in `earthbeat.experience`. Earthbeat narration requires an explicit choice and never starts automatically on page load.

## Language and narration

English is the default, regardless of the device language. A native Language selector in both experiences offers English first and Español second. The explicit choice is saved in `earthbeat.language`. Page language, titles, accessible labels, stories, scene controls, and narration follow that choice.

- **Start with my screen reader** uses semantic headings, native controls, and heading focus on step changes. It does not activate or detect the system screen reader.
- **Start with Earthbeat narration** uses browser `SpeechSynthesis`. English requests `en-US`; Spanish requests `es-ES`. A voice matching the language is selected when available. If none is listed, the browser receives the requested language and handles voice availability. Playback errors keep screen-reader navigation available.
- Changing language cancels pending narration and pointer reading. The current guided step and story remain selected; enabled narration reads the newly translated content.
- Operating a sound scene cancels narration. Reading again requests a scene pause. Leaving the experience cancels speech.

TalkBack is an Android feature and must be enabled on the device. Earthbeat cannot change TalkBack's system settings or installed voices. Its page and iframe `lang` attributes tell screen readers which content language to use; actual automatic switching depends on the reader's configuration. The app's narration reads existing interface content and does not provide conversational AI answers.

## Navigation

After the welcome, four steps cover choosing a story, its context, listening and exploration, and interpretation limits. The visual experience is available without completing the guide.

In the reading area, right-click advances and left-click goes back. This can be disabled in preferences. Native controls, links, keyboard context menus, touch, and screen-reader activation keep their usual behavior. **Previous** and **Next** provide equivalent native actions. Arrow keys only change steps from non-interactive text.

Optional pointer reading waits 600 ms over text or a control, requires narration to be enabled, and is disabled while a scene plays. Keyboard focus can read the same controls. No task requires a mouse.

The guide prioritizes summaries and scene options, hiding decorative maps and charts. Dates, comparisons, routes, instruments, and particle choices remain available. The player appears only in the listening step. The visual experience keeps maps and charts and shows the player only on a track page.

## Scene language contract

`lang=en` or `lang=es` selects the initial scene language. Without a valid query value, standalone scenes use the saved language or English. `guiado=1&contraste=1` selects the guided layout and high contrast.

The iframe bridge accepts `{ eij: 'idioma', valor: 'en' | 'es' }` only from its parent on the same origin. Existing scene controls and selected years, routes, instruments, and playback position are retained when switching languages. The scene's `idioma` callback updates existing bilingual text; it does not change the sound engine. `pausar` pauses a scene, and `entrada` notifies the guide that a user is operating a control.

## Validation limits

Check a first visit with English defaults, changing to Spanish, reload persistence, switching back to English, and every story in both experiences. Verify spoken language, native labels, timeline values, iframe language, keyboard focus, contrast, mobile layout, and the fallback without speech support.

Inspecting the accessibility tree and testing desktop navigation do not replace real-device testing with TalkBack, NVDA/VoiceOver, and blind users. Complete those checks before claiming verified compatibility.
