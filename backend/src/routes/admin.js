const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, addUser } = require('../controllers/AdminController');
const jwt = require('jsonwebtoken');

// Middleware to protect routes and check for admin role
const isAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.get('/users', isAdmin, getAllUsers);
router.post('/users', isAdmin, addUser);
router.delete('/users/:id', isAdmin, deleteUser);

module.exports = router;
