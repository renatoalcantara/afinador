import { useEffect, useState } from 'react'
import { CentsMeter } from '../components/tuner/CentsMeter'
import { InstrumentSelector } from '../components/tuner/InstrumentSelector'
import { LevelMeter } from '../components/tuner/LevelMeter'
import { MicPermissionPrompt } from '../components/tuner/MicPermissionPrompt'
import { NoteDisplay } from '../components/tuner/NoteDisplay'
import { StringSelector } from '../components/tuner/StringSelector'
import { TunerGauge } from '../components/tuner/TunerGauge'
import { TuningSelector } from '../components/tuner/TuningSelector'
import { PageHeader } from '../components/ui/PageHeader'
import { useSettings } from '../context/SettingsContext'
import { useTuner } from '../hooks/useTuner'
import { getActiveTuning, getInstrument } from '../lib/instruments/instruments'

export function TunerPage() {
  const { instrumentId, setInstrumentId, tuningId, setTuningId, mode, a4 } = useSettings()
  const [manualStringIndex, setManualStringIndex] = useState<number | null>(null)

  const instrument = getInstrument(instrumentId)
  const activeTuning = getActiveTuning(instrument, tuningId)
  const strings = activeTuning.strings

  const tuner = useTuner({ instrument, tuningId, mode, manualStringIndex, a4 })
  const running = tuner.micState === 'running'
  const { start } = tuner

  // Ao trocar de instrumento ou afinação, volta a corda para automático.
  useEffect(() => {
    setManualStringIndex(null)
  }, [instrumentId, tuningId])

  // Se a permissão do microfone já foi concedida, inicia sozinho (sem re-perguntar).
  useEffect(() => {
    let cancelled = false
    const tryAutoStart = async () => {
      try {
        const status = await navigator.permissions?.query({
          name: 'microphone' as unknown as PermissionName,
        })
        if (!cancelled && status?.state === 'granted') void start()
      } catch {
        // Permissions API indisponível (ex.: Safari) — mantém o botão de permissão.
      }
    }
    void tryAutoStart()
    return () => {
      cancelled = true
    }
  }, [start])

  const eyebrow =
    mode === 'chromatic'
      ? 'Cromático'
      : activeTuning.id === 'standard'
        ? instrument.name
        : `${instrument.name} · ${activeTuning.shortName}`

  return (
    <div className="flex h-full flex-col px-4">
      <PageHeader title="Afinador" eyebrow={eyebrow} />

      {running ? (
        <div className="flex min-h-0 flex-1 flex-col pb-2">
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-2">
            {/* medidor de captação: vertical, colado à direita e centralizado */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <LevelMeter level={tuner.level} />
            </div>

            <TunerGauge
              cents={tuner.reading?.cents ?? null}
              inTune={tuner.reading?.inTune ?? false}
              active={!tuner.silent && tuner.reading != null}
            />
            <NoteDisplay reading={tuner.reading} silent={tuner.silent} />
            <CentsMeter reading={tuner.reading} silent={tuner.silent} />
          </div>

          {mode === 'instrument' && (
            <div className="flex animate-fade-in flex-col gap-3">
              <InstrumentSelector value={instrumentId} onChange={setInstrumentId} />
              <TuningSelector
                tunings={instrument.tunings}
                value={tuningId}
                onChange={setTuningId}
              />
              <StringSelector
                strings={strings}
                activeIndex={tuner.reading?.stringIndex ?? null}
                manualIndex={manualStringIndex}
                inTune={tuner.reading?.inTune ?? false}
                onSelect={setManualStringIndex}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <MicPermissionPrompt state={tuner.micState} error={tuner.error} onStart={start} />
        </div>
      )}
    </div>
  )
}
