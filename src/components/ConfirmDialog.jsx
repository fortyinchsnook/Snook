export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay show">
      <div className="confirm-card">
        <div className="icon">🗑️</div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm-del" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
