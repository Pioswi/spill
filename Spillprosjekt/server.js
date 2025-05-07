require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./js/database.js');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(session({
    secret: process.env.SECRET_KEY || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.authenticateUser(username, password);
        if (user) {
            req.session.userId = user.id;
            req.session.username = user.username;
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Save score endpoint
app.post('/save-score', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { score } = req.body;
    try {
        await db.saveGameSession(req.session.userId, score);
        await db.updateHighScore(req.session.userId, score);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save score' });
    }
});

// Get high score endpoint
app.get('/high-score', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const highScore = await db.getHighScore(req.session.userId);
        res.json({ highScore });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get high score' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 