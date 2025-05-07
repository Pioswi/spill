const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const sqlite3 = require('better-sqlite3')
const db = sqlite3('./spill.db', {verbose: console.log})

// Middleware for å parse innkommende forespørsler
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Konfigurere session
app.use(session({
    secret: 'hemmelig_nøkkel',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Sett til true hvis du bruker HTTPS
}));

// Simulerer en database av brukere med hash-verdi for passord
// Legg inn denne hashete passordet for en av brukeree i databasen 
// password: '$2b$10$OaYrsjfSOxIlRl3l6brlTe4erojrTxjgsYSzUNF.uCa9Ny9XMmXoS' 
// Hash av "Passord123"

// Hashing av nytt passord (kan brukes for å opprette brukere)
//    const saltRounds = 10;
//    const hashedPassword = await bcrypt.hash(password, saltRounds);

// Rute for innlogging
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);
    // Finn brukeren basert på brukernavn
    const sql = db.prepare('SELECT password FROM user where username =?') 
    const user = sql.all(username)   
    if (!user) {
        return res.status(401).send('Ugyldig brukernavn eller passord');
    }

    // Sjekk om passordet samsvarer med hash'en i databasen
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        // Lagre innloggingsstatus i session
        req.session.loggedIn = true;
        req.session.username = user.username;
        return res.send('Innlogging vellykket!');
    } else {
        return res.status(401).send('Ugyldig brukernavn eller passord');
    }
});

// Beskyttet rute som krever at brukeren er innlogget
app.get('/dashboard',  checkLoggedIn, (req, res) => {
          res.redirect("/dashboard.html"); // Redirect on successful login
});

function checkLoggedIn(req, res, next) {
    if (req.session && req.session.loggedIn) {
        next(); // Bruker er loggetinn, gå videre
    } else {
        res.redirect('/login'); // Ikke autentisert, omdiriger
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
