import { Modal } from '../Modal';
import './WorkerModals.css';

export function WorkerDetailsModal({ isOpen, onClose, worker }) {
    if (!worker) return null;

    const formatDate = (value) => {
        if (!value) return '—';
        try {
            return new Date(value).toLocaleString();
        } catch {
            return String(value);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`worker details: #${worker.id}`}
            maxWidth="680px"
        >
            <div className="details-grid">
                <div className="details-section">
                    <h4>general info</h4>
                    <p><span>id:</span> {worker.id}</p>
                    <p><span>name:</span> {worker.name}</p>
                    <p><span>salary:</span> {worker.salary}</p>
                    <p><span>rating:</span> {worker.rating}</p>
                    <p><span>position:</span> {worker.position || 'null'}</p>
                    <p><span>status:</span> {worker.status}</p>
                    <p><span>start date:</span> {formatDate(worker.startDate)}</p>
                    <p><span>creation date:</span> {formatDate(worker.creationTime)}</p>
                </div>

                <div className="details-section">
                    <h4>coordinates (#{worker.coordinates?.id})</h4>
                    <p><span>x:</span> {worker.coordinates?.x}</p>
                    <p><span>y:</span> {worker.coordinates?.y}</p>
                </div>

                <div className="details-section">
                    <h4>person (#{worker.person?.id})</h4>
                    <p><span>passport id:</span> {worker.person?.passportID}</p>
                    <p><span>eye color:</span> {worker.person?.eyeColor}</p>
                    <p><span>hair color:</span> {worker.person?.hairColor || 'null'}</p>
                    <p><span>height:</span> {worker.person?.height}</p>
                    <p><span>nationality:</span> {worker.person?.nationality || 'null'}</p>
                    <p><span>birthday:</span> {formatDate(worker.person?.birthday)}</p>
                    <p>
                        <span>location:</span>{' '}
                        {worker.person?.location
                            ? `#${worker.person.location.id} (${worker.person.location.x}, ${worker.person.location.y}, ${worker.person.location.z})`
                            : '—'}
                    </p>
                </div>

                <div className="details-section">
                    <h4>organization</h4>
                    {worker.organization ? (
                        <>
                            <p><span>id:</span> {worker.organization.id}</p>
                            <p><span>type:</span> {worker.organization.type || 'null'}</p>
                            <p><span>rating:</span> {worker.organization.rating}</p>
                            <p><span>annual turnover:</span> {worker.organization.annualTurnover}</p>
                            <p><span>employees count:</span> {worker.organization.employeesCount ?? 'null'}</p>
                            <p><span>postal address:</span> {worker.organization.postalAddress?.street || '—'}</p>
                            <p><span>official address:</span> {worker.organization.officialAddress?.street || 'null'}</p>
                        </>
                    ) : (
                        <p><span>organization:</span> null (unassigned)</p>
                    )}
                </div>
            </div>

            <div className="modal-actions">
                <button type="button" className="btn-primary" onClick={onClose}>
                    close
                </button>
            </div>
        </Modal>
    );
}
