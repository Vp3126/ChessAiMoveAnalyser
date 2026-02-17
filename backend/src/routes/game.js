const express = require('express');
const router = express.Router();
const { createGame, getGames, getGameById } = require('../controllers/GameController');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

router.post('/', auth, createGame);
router.get('/', auth, getGames);
router.get('/:id', auth, getGameById);

module.exports = router;
