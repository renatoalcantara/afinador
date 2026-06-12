import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  /** mensagem a exibir; null/'' oculta o toast */
  message: string | null
  /** chamado quando o toast deve sumir (auto-dismiss) */
  onDismiss: () => void
  /** tempo na tela em ms */
  duration?: number
}

/**
 * Toast efêmero, centralizado acima da navbar. Aparece com fade-in-up e some
 * sozinho após `duration`. Renderizado num portal para ficar acima de tudo.
 */
export function Toast({ message, onDismiss, duration = 2200 }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [message, onDismiss, duration])

  if (!message) return null

  return createPortal(
    <div
      className="safe-x pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="animate-fade-in-up rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text shadow-soft">
        {message}
      </div>
    </div>,
    document.body,
  )
}
