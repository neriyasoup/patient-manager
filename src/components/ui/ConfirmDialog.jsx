import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'מחק', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>ביטול</Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'מוחק...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
