import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, PlayCircle, ChevronRight, History, Shield } from 'lucide-react';

const API_BASE = (import.meta?.env?.VITE_BACKEND_URL || '').trim();

function Dashboard() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
                const url = base ? `${base}/api/games` : '/api/games';
                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                setGames(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error(err);
                setGames([]);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, []);

    if (loading) return <div className="text-center py-20 text-text-muted">Loading your games...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-white">Your Game History</h1>
                    <p className="text-text-muted mt-1">Review your past performance and AI analysis</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-primary/20 px-4 py-2 rounded-xl text-primary font-bold border border-primary/30 flex items-center gap-2">
                        <History size={16} /> {(games || []).length} Games
                    </div>
                    {JSON.parse(localStorage.getItem('user'))?.role === 'admin' && (
                        <Link to="/admin" className="bg-accent/20 px-4 py-2 rounded-xl text-accent font-bold border border-accent/30 flex items-center gap-2 hover:bg-accent/30 transition-all">
                            <Shield size={16} /> Admin Panel
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {(games || []).length === 0 ? (
                    <div className="glass p-12 text-center text-text-muted">
                        <PlayCircle className="mx-auto mb-4 opacity-20" size={60} />
                        <p className="text-xl">No games found yet. Go play some chess!</p>
                    </div>
                ) : (
                    (games || []).map((game) => (
                        <div key={game._id} className="glass p-6 flex justify-between items-center hover:bg-white/5 transition-all cursor-pointer group">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <PlayCircle />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-lg mb-1">
                                        Game against AI
                                    </div>
                                    <div className="flex items-center gap-4 text-text-muted text-sm">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {game.createdAt ? new Date(game.createdAt).toLocaleDateString() : '—'}</span>
                                        <span>{(game.moves || []).length} Moves</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${game.result === 'ongoing' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {game.result}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="text-text-muted group-hover:translate-x-1 transition-transform" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Dashboard;
