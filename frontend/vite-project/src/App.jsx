import './App.css'
import {useState} from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import CreatePage from "./pages/CreatePage.jsx";
import MainPage from "./pages/MainPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import SvoPage from "./pages/SvoPage.jsx";

function App() {
    const [currentPage, setCurrentPage] = useState('main')
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const [message, setMessage] = useState({text: '', type: ''});

    const showMessage = (text, type) => {
        setMessage({text, type});
        setTimeout(() => {
            setMessage({text: '', type: ''});
        }, 4000);
    };

    return (
        <div className="page-container">
            <Header currentPage={currentPage} setCurrentPage={setCurrentPage} isLoggedIn={isLoggedIn} />

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <main>
                {currentPage === 'create' ? (
                    <CreatePage showMessage={showMessage} />
                ) : currentPage === 'search' ? (
                    <SearchPage showMessage={showMessage} />
                ) : currentPage === 'svo' ? (
                    <SvoPage showMessage={showMessage} />
                ) : (
                    <MainPage showMessage={showMessage} />
                )}
            </main>

            <Footer />
        </div>
    );
}

export default App;