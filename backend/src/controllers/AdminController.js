const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Don't allow deleting the main admin through the API for safety
        if (user.email === 'vp312600@gmail.com') {
            return res.status(403).json({ error: 'Cannot delete the primary admin account' });
        }

        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const user = new User({ username, email, password, role });
        await user.save();
        res.status(201).json({ message: 'User added successfully', user: { id: user._id, username, email, role } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
