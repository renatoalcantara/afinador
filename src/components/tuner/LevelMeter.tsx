interface LevelMeterProps {
  /** nível de captação em [0,1] */
  level: number
}

const SEGMENTS = 12

/**
 * Medidor de captação do microfone (estilo LED/VU), na vertical. Responde na
 * hora ao volume de entrada — serve para o usuário ver se o microfone está
 * captando, mesmo antes de a nota travar. Acende de baixo para cima.
 */
export function LevelMeter({ level }: LevelMeterProps) {
  const lit = Math.round(level * SEGMENTS)
  const active = level > 0.03

  return (
    <div
      className="flex flex-col items-center gap-2"
      aria-label={`Captação do microfone: ${Math.round(level * 100)}%`}
    >
      {/* coluna de segmentos: flex-col-reverse → índice 0 acende embaixo */}
      <div className="flex h-32 w-1.5 flex-col-reverse items-stretch gap-0.5">
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const on = i < lit
          const color = i >= 10 ? 'bg-error' : i >= 8 ? 'bg-brand' : 'bg-success'
          return (
            <span
              key={i}
              className={`flex-1 rounded-sm transition-colors duration-75 ${on ? color : 'bg-surface-2'}`}
            />
          )
        })}
      </div>
      {/* luz: acende quando há sinal */}
      <span
        className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-100 ${
          active ? 'bg-success shadow-glow-success' : 'bg-surface-2'
        }`}
      />
    </div>
  )
}
