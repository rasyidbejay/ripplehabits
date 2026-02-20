import type { ReactNode } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-0 md:items-center md:pb-4">
      <div className="w-full max-w-md rounded-t-2xl border border-border bg-surface-secondary p-5 shadow-xl md:rounded-2xl">
        <h2 className="text-lg font-semibold text-content-primary">{title}</h2>
        <p className="mt-2 text-sm text-content-secondary">{children}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-lg border border-border px-3 py-2 text-sm text-content-secondary hover:bg-surface-tertiary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-11 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
