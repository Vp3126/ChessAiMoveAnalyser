import { Link } from 'react-router-dom';
import { LogIn, UserPlus, LogOut, Swords, Shield, Play } from 'lucide-react';

function Navbar({ user, onLogout }) {
    return (
        <nav className="mx-4 mt-4 relative z-50">
            <div className="glass px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                        <Swords className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter">
                        CHESS<span className="text-indigo-500">AI</span>
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            {(user.user?.role === 'admin' || user.user?.email === 'vp312600@gmail.com') && (
                                <Link to="/admin" className="flex items-center gap-2 text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
                                    <Shield size={18} /> Admin
                                </Link>
                            )}
                            <Link to="/dashboard" className="text-slate-400 hover:text-white font-medium transition-colors">History</Link>
                            <Link to="/game" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
                                <Play size={16} fill="currentColor" /> Play
                            </Link>
                            <div className="h-8 w-px bg-white/10 mx-2"></div>
                            <button onClick={onLogout} className="text-rose-400 hover:text-rose-300 transition-colors">
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-slate-400 hover:text-white font-bold transition-colors">Login</Link>
                            <Link to="/signup" className="btn-primary py-2 px-5 text-sm uppercase tracking-wider">
                                Signup
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
