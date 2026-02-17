const io = require('socket.io-client');
const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('✅ Connected to backend socket!');
    socket.emit('move', {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        move: { from: 'e2', to: 'e4' }
    });
});

socket.on('analysis', (data) => {
    console.log('📊 Received analysis:', data);
    process.exit(0);
});

socket.on('error', (err) => {
    console.error('❌ Socket error:', err);
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
});

setTimeout(() => {
    console.log('⏰ Timeout reached');
    process.exit(1);
}, 10000);
