import type { ReactNode } from 'react'
import { ActionButton, SecondaryButton } from './ui/primitives'

export const ConfirmDialog = ({ open, title, children, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }: { open: boolean; title: string; children: ReactNode; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void; onCancel: () => void }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-secondary p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-content-primary">{title}</h2>
        <p className="mt-2 text-sm text-content-secondary">{children}</p>
        <div className="mt-5 flex justify-end gap-2">
          <SecondaryButton onClick={onCancel}>{cancelLabel}</SecondaryButton>
          <ActionButton className="bg-rose-600" onClick={onConfirm}>{confirmLabel}</ActionButton>
        </div>
      </div>
    </div>
  )
}
