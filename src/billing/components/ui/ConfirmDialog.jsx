import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'מחק', danger = true }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 text-sm mb-6">{message}</p>
      <div className="flex justify-start gap-3">
        <Button variant="secondary" onClick={onClose}>ביטול</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
