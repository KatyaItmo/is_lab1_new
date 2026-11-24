import { Modal } from './Modal';

export function ConfirmActionModal({
                                       isOpen,
                                       onClose,
                                       onConfirm,
                                       title = 'confirm action',
                                       message = 'are you sure?',
                                       confirmText = 'confirm',
                                       isDanger = true,
                                       isSubmitting = false,
                                   }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="460px">
            <div className="modal-form">
                <p style={{ fontSize: '17px', lineHeight: '1.6' }}>{message}</p>

                <div className="modal-actions">
                    <button type="button" onClick={onClose} disabled={isSubmitting}>
                        cancel
                    </button>
                    <button
                        type="button"
                        className={isDanger ? 'btn-danger' : 'btn-primary'}
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'please wait...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
