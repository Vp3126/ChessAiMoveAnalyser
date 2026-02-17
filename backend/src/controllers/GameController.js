const Game = require('../models/Game');

exports.createGame = async (req, res) => {
    try {
        const game = new Game({ userId: req.user.userId, moves: [] });
        await game.save();
        res.status(201).json(game);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGames = async (req, res) => {
    try {
        const games = await Game.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(games);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        res.json(game);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
