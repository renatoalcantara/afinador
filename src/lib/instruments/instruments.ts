import type { NoteName } from '../music/noteUtils'
import { noteLabel } from '../music/noteUtils'
import type { Instrument, InstrumentId, StringSpec, Tuning } from './types'

function s(note: NoteName, octave: number): StringSpec {
  return { note, octave, label: noteLabel(note, octave) }
}

// ─── Violão / Guitarra ────────────────────────────────────────────────────────

const guitarStandard: Tuning = {
  id: 'standard',
  name: 'Padrão (E A D G B E)',
  shortName: 'Padrão',
  strings: [s('E', 2), s('A', 2), s('D', 3), s('G', 3), s('B', 3), s('E', 4)],
}

const guitarDropD: Tuning = {
  id: 'drop-d',
  name: 'Drop D (D A D G B E)',
  shortName: 'Drop D',
  strings: [s('D', 2), s('A', 2), s('D', 3), s('G', 3), s('B', 3), s('E', 4)],
}

const guitarDadgad: Tuning = {
  id: 'dadgad',
  name: 'DADGAD (D A D G A D)',
  shortName: 'DADGAD',
  strings: [s('D', 2), s('A', 2), s('D', 3), s('G', 3), s('A', 3), s('D', 4)],
}

const guitarOpenG: Tuning = {
  id: 'open-g',
  name: 'Open G (D G D G B D)',
  shortName: 'Open G',
  strings: [s('D', 2), s('G', 2), s('D', 3), s('G', 3), s('B', 3), s('D', 4)],
}

// Meio tom abaixo: D# G# C# F# A# D# (enarmônico de Eb Ab Db Gb Bb Eb)
const guitarHalfDown: Tuning = {
  id: 'half-down',
  name: 'Meio tom abaixo (Eb Ab Db Gb Bb Eb)',
  shortName: '½ Tom ↓',
  strings: [s('D#', 2), s('G#', 2), s('C#', 3), s('F#', 3), s('A#', 3), s('D#', 4)],
}

// ─── Ukulele ──────────────────────────────────────────────────────────────────

const ukuleleStandard: Tuning = {
  id: 'standard',
  name: 'Padrão (G C E A)',
  shortName: 'Padrão',
  strings: [s('G', 4), s('C', 4), s('E', 4), s('A', 4)],
}

// ─── Baixo 4 cordas ───────────────────────────────────────────────────────────

const bassStandard: Tuning = {
  id: 'standard',
  name: 'Padrão (E A D G)',
  shortName: 'Padrão',
  strings: [s('E', 1), s('A', 1), s('D', 2), s('G', 2)],
}

const bassDropD: Tuning = {
  id: 'drop-d',
  name: 'Drop D (D A D G)',
  shortName: 'Drop D',
  strings: [s('D', 1), s('A', 1), s('D', 2), s('G', 2)],
}

// ─── Baixo 5 cordas ───────────────────────────────────────────────────────────

const bass5Standard: Tuning = {
  id: 'standard',
  name: 'Padrão (B E A D G)',
  shortName: 'Padrão',
  strings: [s('B', 0), s('E', 1), s('A', 1), s('D', 2), s('G', 2)],
}

const bass5DropA: Tuning = {
  id: 'drop-a',
  name: 'Drop A (A E A D G)',
  shortName: 'Drop A',
  strings: [s('A', 0), s('E', 1), s('A', 1), s('D', 2), s('G', 2)],
}

// ─── Catálogo ─────────────────────────────────────────────────────────────────

export const INSTRUMENTS: Record<InstrumentId, Instrument> = {
  violao: {
    id: 'violao',
    name: 'Violão',
    shortName: 'Violão',
    tunings: [guitarStandard, guitarDropD, guitarDadgad, guitarOpenG, guitarHalfDown],
    defaultTuningId: 'standard',
  },
  guitarra: {
    id: 'guitarra',
    name: 'Guitarra',
    shortName: 'Guitarra',
    tunings: [guitarStandard, guitarDropD, guitarDadgad, guitarOpenG, guitarHalfDown],
    defaultTuningId: 'standard',
  },
  ukulele: {
    id: 'ukulele',
    name: 'Ukulele',
    shortName: 'Ukulele',
    tunings: [ukuleleStandard],
    defaultTuningId: 'standard',
  },
  baixo: {
    id: 'baixo',
    name: 'Baixo 4',
    shortName: 'Baixo 4',
    tunings: [bassStandard, bassDropD],
    defaultTuningId: 'standard',
  },
  baixo5: {
    id: 'baixo5',
    name: 'Baixo 5',
    shortName: 'Baixo 5',
    tunings: [bass5Standard, bass5DropA],
    defaultTuningId: 'standard',
  },
}

export const INSTRUMENT_LIST: Instrument[] = [
  INSTRUMENTS.violao,
  INSTRUMENTS.guitarra,
  INSTRUMENTS.ukulele,
  INSTRUMENTS.baixo,
  INSTRUMENTS.baixo5,
]

export const DEFAULT_INSTRUMENT_ID: InstrumentId = 'violao'

export function getInstrument(id: InstrumentId): Instrument {
  return INSTRUMENTS[id]
}

export function getActiveTuning(instrument: Instrument, tuningId?: string): Tuning {
  const id = tuningId ?? instrument.defaultTuningId
  return instrument.tunings.find((t) => t.id === id) ?? instrument.tunings[0]
}
