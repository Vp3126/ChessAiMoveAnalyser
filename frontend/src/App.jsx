import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GameRoom from './pages/GameRoom';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    const handleLogin = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                <Navbar user={user} onLogout={handleLogout} />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login onLogin={handleLogin} />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route
                            path="/game"
                            element={user ? <GameRoom /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/dashboard"
                            element={user ? <Dashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/admin"
                            element={user && (user.user?.role === 'admin' || user.user?.email === 'vp312600@gmail.com') ? <AdminPanel /> : <Navigate to="/" />}
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
