type SpriteName =
  | 'planet'
  | 'ocean'
  | 'current'
  | 'cloud'
  | 'air'
  | 'carbon'
  | 'bolt'
  | 'river'
  | 'forest'

const shapes: Record<SpriteName, string[]> = {
  planet: [
    '    bbbb    ',
    '  bbttttbb  ',
    ' btgggttttb ',
    'btggggttggtb',
    'bttggttgggtb',
    'btttttgggttb',
    'bttggttggttb',
    ' bttggttttb ',
    '  bbttttbb  ',
    '    bbbb    ',
  ],
  ocean: [
    '            ',
    '       ttt  ',
    '     ttt tt ',
    '    tggt    ',
    '   tggt     ',
    ' tttggt   tt',
    'ttgggggttttg',
    'ggbbgggggggg',
    'bbbbbbbbbbbb',
    '            ',
  ],
  current: [
    '            ',
    '    bttttb  ',
    '  btggggttb ',
    ' btggttgggt ',
    ' ttgt  ttgt ',
    ' tggt   tgt ',
    ' ttggttgggt ',
    '  bttgggttb ',
    '    btttb   ',
    '            ',
  ],
  cloud: [
    '            ',
    '      tt    ',
    '    ttggtt  ',
    '   tggggggt ',
    '  ttggggggtt',
    ' tgggggggggt',
    '  ttttttttt ',
    '   b  bb b  ',
    '  b  bb b   ',
    '            ',
  ],
  air: [
    '            ',
    '      bttb  ',
    '  ttttt ggb ',
    '        ggt ',
    ' tttttttgt  ',
    '            ',
    '  ttttttggt ',
    '       tggt ',
    '      bttb  ',
    '            ',
  ],
  carbon: [
    '            ',
    '      tt    ',
    '     tggt   ',
    '  tt tggt   ',
    ' tggtbttb   ',
    ' tggt  btt  ',
    '  tt  btggt ',
    '      btggt ',
    '       btt  ',
    '            ',
  ],
  bolt: [
    '      gggg  ',
    '     gggg   ',
    '    gggg    ',
    '   gggg     ',
    '  gggggggg  ',
    '      ggg   ',
    '     ggg    ',
    '    ggg     ',
    '    gg      ',
    '   g        ',
  ],
  river: [
    '  bb    gg  ',
    ' btb   gggg ',
    'btgtb gguugg',
    '  tt        ',
    '   ttttt    ',
    '      tgtt  ',
    '     tgtt   ',
    '   ttgt     ',
    ' ttggt      ',
    'tggtt       ',
  ],
  forest: [
    '     t      ',
    '    tgt  t  ',
    '   tgggt tgt',
    '    tgt tggg',
    '  ttgggtttgt',
    ' tgggggggggg',
    '    bb   bb ',
    '    bb   bb ',
    '  ttttttttt ',
    '            ',
  ],
}
const species: SpriteName[] = [
  'planet',
  'ocean',
  'current',
  'cloud',
  'air',
  'carbon',
  'bolt',
  'river',
  'forest',
]
const colors = [
  ['#4361a4', '#72a6ed', '#6bdfbd'],
  ['#2e5b92', '#75dfa8', '#38aebb'],
  ['#514b98', '#968eed', '#62bff1'],
  ['#706071', '#b9a1e3', '#efd0ac'],
  ['#46677f', '#92e7e0', '#60acb4'],
  ['#6c467b', '#bc87ce', '#dcabd1'],
  ['#806d58', '#d99d67', '#ffdb78'],
  ['#426298', '#91bff0', '#51c9ae'],
  ['#305e58', '#52aa78', '#a2db84'],
]
export function Sprite({
  index = 0,
  className = '',
}: {
  index?: number
  className?: string
}) {
  const rows = shapes[species[index] ?? 'planet']
  const palette = colors[index] ?? colors[0]
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 14 14"
      shapeRendering="crispEdges"
    >
      {rows.flatMap((row, y) =>
        Array.from(row, (value, x) => {
          const color = {
            b: palette[0],
            t: palette[1],
            g: palette[2],
            u: '#e7f6ed',
          }[value]
          return color ? (
            <rect
              key={x + '-' + y}
              x={x + 1}
              y={y + 2}
              width="1"
              height="1"
              fill={color}
            />
          ) : null
        }),
      )}
    </svg>
  )
}

const icons = {
  signal:
    'M2 10h2v4H2z M6 6h2v12H6z M10 3h2v18h-2z M14 8h2v8h-2z M18 5h2v14h-2z',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  sliders: 'M3 5h6V3h4v2h8v2h-8v2H9V7H3z M3 16h11v-2h4v2h3v2h-3v2h-4v-2H3z',
  help: 'M6 3h12v3H6z M3 6h3v12H3z M18 6h3v12h-3z M6 18h12v3H6z M9 7h6v2H9z M13 9h2v3h-3v2h-2v-4h3z M10 15h2v2h-2z',
  external: 'M12 3h9v9h-3V8l-8 8-2-2 8-8h-4z M3 6h6v3H6v9h9v-3h3v6H3z',
  book: 'M2 4h8l2 2 2-2h8v14h-8l-2 2-2-2H2z M5 7v8h5V7z M14 7v8h5V7z',
  close: 'M4 6l2-2 6 6 6-6 2 2-6 6 6 6-2 2-6-6-6 6-2-2 6-6z',
  right: 'M7 4h3v3h3v3h3v4h-3v3h-3v3H7v-3h3v-3h3v-4h-3V7H7z',
  headset:
    'M7 3h10v2H7z M5 5h2v2H5z M17 5h2v2h-2z M3 7h2v6h4v7H3z M19 7h2v13h-6v-7h4z',
}
export function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg
      className="ui-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path fillRule="evenodd" d={icons[name]} />
    </svg>
  )
}
