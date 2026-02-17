import { Link } from 'react-router-dom';
import { Play, Shield, Cpu, Zap, History, Star, ArrowRight } from 'lucide-react';

function Home() {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <div className="text-center py-20 px-4 max-w-4xl animate-in fade-in zoom-in duration-1000">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 text-sm font-bold mb-8">
                    <Star size={16} fill="currentColor" />
                    Powered by custom C++ Engine v1.0
                </div>

                <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
                    Master the Board with <br />
                    <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                        Real-Time Intelligence
                    </span>
                </h1>

                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Experience lightning-fast chess analysis. Harness the power of our custom C++ core
                    to identify best moves, evaluate positions, and refine your strategy instantly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/game" className="btn-primary px-10 py-4 text-xl group w-full sm:w-auto">
                        Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/signup" className="glass px-10 py-4 text-xl font-bold hover:bg-white/5 transition-all w-full sm:w-auto">
                        Join the Community
                    </Link>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4 py-20">
                <div className="glass p-10 glass-hover">
                    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
                        <Cpu size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">C++ Core</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Proprietary engine built in C++ featuring Minimax search with alpha-beta pruning for ultra-precise evaluations.
                    </p>
                </div>

                <div className="glass p-10 border-indigo-500/20 glass-hover">
                    <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">Real-Time</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Instant feedback delivered through high-performance WebSockets. See move evaluations as you play.
                    </p>
                </div>

                <div className="glass p-10 glass-hover">
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6">
                        <History size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">Game History</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Every move and evaluation is automatically saved to your dashboard for post-game review and learning.
                    </p>
                </div>
            </div>

            {/* Social proof/Footer simple */}
            <footer className="w-full border-t border-white/5 py-12 text-center text-slate-500 text-sm">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Shield size={16} /></div>
                    <span>Secure data storage with MongoDB Atlas</span>
                </div>
                © 2026 ChessAI Analyzer. All rights reserved.
            </footer>
        </div>
    );
}

export default Home;
