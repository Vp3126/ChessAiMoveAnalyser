const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moves: [{
        from: String,
        to: String,
        fen: String,
        evaluation: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    result: { type: String, default: 'ongoing' }, // 'white', 'black', 'draw', 'ongoing'
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema);
