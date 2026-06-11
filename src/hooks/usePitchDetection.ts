import { useEffect, useState } from 'react'
import {
  ATTACK_FLOOR,
  ATTACK_RATIO,
  CLARITY_THRESHOLD,
  DETECT_INTERVAL_MS,
  HOLD_MS,
  MAX_PERSIST_MS,
  RMS_GATE,
} from '../lib/audio/audioConstants'
import { computeRMS } from '../lib/audio/noiseGate'
import { detectPitch } from '../lib/audio/pitchDetector'

export interface RawReading {
  frequency: number
  clarity: number
  rms: number
}

export interface PitchDetectionState {
  reading: RawReading | null
  silent: boolean
}

/**
 * Laço de requestAnimationFrame que lê o domínio do tempo do analyser, aplica
 * gate de ruído e devolve a leitura crua.
 *
 * Persistência por "janela rearmável" (sem estado preso): cada palhetada — uma
 * borda de subida do volume, ou o primeiro som após silêncio — arma a exibição
 * por ~MAX_PERSIST_MS (2s). Passada a janela sem nova palhetada, a tela limpa,
 * mesmo que a corda ainda ressoe. Como tudo deriva de timestamps/bordas, um
 * toque novo sempre reativa e nunca trava.
 */
export function usePitchDetection(
  analyser: AnalyserNode | null,
  sampleRate: number,
  enabled: boolean,
): PitchDetectionState {
  const [reading, setReading] = useState<RawReading | null>(null)
  const [silent, setSilent] = useState(true)

  useEffect(() => {
    if (!analyser || !enabled) {
      setSilent(true)
      return
    }

    const buffer = new Float32Array(analyser.fftSize)
    const ctx = analyser.context as AudioContext
    let raf = 0
    let last = 0
    let lastGood = 0 // instante do último quadro bom
    let armUntil = 0 // exibe enquanto t <= armUntil
    let prevRms = 0

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (t - last < DETECT_INTERVAL_MS) return
      last = t

      // Rede de segurança: o celular pode suspender o AudioContext após um tempo.
      if (ctx.state === 'suspended') void ctx.resume().catch(() => {})

      analyser.getFloatTimeDomainData(buffer)
      const rms = computeRMS(buffer)

      let result: ReturnType<typeof detectPitch> = null
      if (rms >= RMS_GATE) {
        const r = detectPitch(buffer, sampleRate)
        if (r && r.clarity >= CLARITY_THRESHOLD) result = r
      }

      const wasSilent = t - lastGood > HOLD_MS
      const isOnset =
        !!result && (wasSilent || (rms > prevRms * ATTACK_RATIO && rms > ATTACK_FLOOR))
      prevRms = rms

      if (result) {
        lastGood = t
        if (isOnset) armUntil = t + MAX_PERSIST_MS // (re)arma ~2s a cada palhetada
        if (t <= armUntil) {
          setReading({ frequency: result.frequency, clarity: result.clarity, rms })
          setSilent(false)
        } else {
          // janela de ~2s expirou; aguarda nova palhetada para rearmar
          setSilent(true)
        }
      } else if (t - lastGood > HOLD_MS) {
        setSilent(true)
      }
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [analyser, sampleRate, enabled])

  return { reading, silent }
}
