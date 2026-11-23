function Header({ currentPage, setCurrentPage, isLoggedIn }) {
    return (
        <header>
            <h1>лабораторная работа №1</h1>

            <div id="header-tab-bar">
                <div className="tabs-container" id="header-tabs-container">
                    <div className="tab-container">
                        <button
                            className="tab-button"
                            type="button"
                            onClick={() => setCurrentPage('main')}
                        >
                            список объектов
                        </button>
                    </div>

                    <div className="tab-container">
                        <button
                            className="tab-button"
                            type="button"
                            onClick={() => setCurrentPage('search')}
                        >
                            найти
                        </button>
                    </div>

                    <div className="tab-container">
                        <button
                            className="tab-button"
                            type="button"
                            onClick={() => setCurrentPage('create')}
                        >
                            создать
                        </button>
                    </div>

                    <div className="tab-container">
                        <button
                            className="tab-button"
                            type="button"
                            onClick={() => setCurrentPage('update')}
                        >
                            изменить
                        </button>
                    </div>

                    <div className="tab-container">
                        <button
                            className="tab-button"
                            type="button"
                            onClick={() => setCurrentPage('delete')}
                        >
                            удалить
                        </button>
                    </div>

                    <div className="tab-container">
                        <button
                            className="tab-button"
                            type="button"
                            onClick={() => setCurrentPage('svo')}
                        >
                            сво
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;