import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Trash2, UserPlus, Shield, Mail, Calendar } from 'lucide-react';

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });

    const fetchUsers = async () => {
        try {
            const authUser = JSON.parse(localStorage.getItem('user'));
            const res = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${authUser.token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const authUser = JSON.parse(localStorage.getItem('user'));
            await axios.delete(`/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${authUser.token}` }
            });
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const authUser = JSON.parse(localStorage.getItem('user'));
            await axios.post('/api/admin/users', newUser, {
                headers: { Authorization: `Bearer ${authUser.token}` }
            });
            setShowAddModal(false);
            setNewUser({ username: '', email: '', password: '', role: 'user' });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add user');
        }
    };

    if (loading) return <div className="text-center py-20 text-text-muted">Loading user management...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">User Management</h1>
                    <p className="text-text-muted">Manage system access and roles</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <UserPlus size={20} /> Add New User
                </button>
            </div>

            <div className="glass overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10 text-text-muted text-sm font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{user.username}</div>
                                            <div className="text-text-muted text-xs flex items-center gap-1">
                                                <Mail size={12} /> {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${user.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {user.role}
                                        </span>
                                        {user.email === 'vp312600@gmail.com' && (
                                            <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">
                                                🛡️ SUPER ADMIN
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-text-muted text-sm">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} /> {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.email !== 'vp312600@gmail.com' ? (
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                            title="Delete User"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    ) : (
                                        <div className="text-xs text-slate-600 italic">Protected</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                            <UserPlus className="text-primary" /> Create New User
                        </h2>
                        <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Role</label>
                                <select
                                    className="input-field appearance-none cursor-pointer"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="user" className="bg-slate-900">User</option>
                                    <option value="admin" className="bg-slate-900">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 glass py-3 font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-3">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
