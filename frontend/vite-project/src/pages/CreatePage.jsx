import {useState} from "react";
import NewWorker from "../components/NewWorker.jsx";
import NewPerson from "../components/NewPerson.jsx";
import NewOrganization from "../components/NewOrganization.jsx";
import NewAddress from "../components/NewAddress.jsx";
import NewLocation from "../components/NewLocation.jsx";
import NewCoordinates from "../components/NewCoordinates.jsx";

function CreatePage({ showMessage }) {
    const [createdObject, setCreatedObject] = useState('none')

    return (
        <div className="interior-container">
            <h2>создание объекта</h2>

            <div className="tabs-container">
                <div className="tab-container">
                    <button
                        className="tab-button"
                        type="button"
                        onClick={() => setCreatedObject('worker')}
                    >
                        + Worker
                    </button>
                </div>

                <div className="tab-container">
                    <button
                        className="tab-button"
                        type="button"
                        onClick={() => setCreatedObject('person')}
                    >
                        + Person
                    </button>
                </div>

                <div className="tab-container">
                    <button
                        className="tab-button"
                        type="button"
                        onClick={() => setCreatedObject('organization')}
                    >
                        + Organization
                    </button>
                </div>

                <div className="tab-container">
                    <button
                        className="tab-button"
                        type="button"
                        onClick={() => setCreatedObject('address')}
                    >
                        + Address
                    </button>
                </div>

                <div className="tab-container">
                    <button
                        className="tab-button"
                        type="button"
                        onClick={() => setCreatedObject('location')}
                    >
                        + Location
                    </button>
                </div>

                <div className="tab-container">
                    <button
                        className="tab-button"
                        type="button"
                        onClick={() => setCreatedObject('coordinates')}
                    >
                        + Coordinates
                    </button>
                </div>
            </div>

            {createdObject === 'worker' ? (
                <NewWorker showMessage={showMessage} />
            ) : createdObject === 'person' ? (
                <NewPerson showMessage={showMessage} />
            ) : createdObject === 'organization' ? (
                <NewOrganization showMessage={showMessage} />
            ) : createdObject === 'address' ? (
                <NewAddress showMessage={showMessage} />
            ) : createdObject === 'location' ? (
                <NewLocation showMessage={showMessage} />
            ) : createdObject === 'coordinates' ? (
                <NewCoordinates showMessage={showMessage} />
            ) : (
                <div>
                    <p className="no-object-message">выберете объект, который хотите создать</p>
                </div>
            )}
        </div>
    );
}

export default CreatePage;