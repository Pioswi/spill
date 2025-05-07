require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session'); // Added session
const path = require('path');
const db = require('./sqlm.js');

const app = express();
const saltRounds = 10;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change to true if using HTTPS
}));

// Middleware to check if user is logged in
function checkLoggedIn(req, res, next) {
    if (req.session.loggedIn) {
        return next();
    }
    return res.redirect('/login.html');
}

// Middleware to check if user is an admin
function checkAdmin(req, res, next) {
    if (req.session.loggedIn && req.session.user.role === 'Administrator') {
        return next();
    }
    res.status(403).json({ error: 'Unauthorized' });
}

// Home route (redirects to game)
app.get('/', checkLoggedIn, (req, res) => {
    res.redirect('/spillet.html');
});

app.get('/index.html', checkLoggedIn, (req, res) => {
    res.redirect('/spillet.html');
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.getUserPassword(username);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        req.session.loggedIn = true;
        req.session.userId = user.userId;
        req.session.username = username;

        res.json({ success: true, message: 'Logged in successfully' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

// Dashboard route
app.get('/dashboard', checkLoggedIn, (req, res) => {
    res.send(`Velkommen, ${req.session.username}!`);
});

// Registration route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userExists = await db.checkUserExists(username);
        if (userExists) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await db.addUser(username, hashedPassword, '');

        if (!newUser) return res.status(500).json({ error: 'Failed to register user.' });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to register user: ' + error.message });
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
        console.error('Error saving score:', error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

// Delete score endpoint
app.post('/delete-score', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        await db.deleteScore(req.session.userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting score:', error);
        res.status(500).json({ error: 'Failed to delete score' });
    }
});

// Leaderboard endpoint
app.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await db.getLeaderboard();
        res.json({ leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
