const sqlite3 = require('better-sqlite3')
global.db  = sqlite3('./spill.db', {verbose: console.log})

function addUser(username, password, epost, isAdmin = 0)
 {
    const sql = global.db.prepare("INSERT INTO user (username, password, epost, isAdmin) " +
                         "VALUES (?, ?, ?, ?, ?)")
    const info = sql.run(username, password, epost, isAdmin)

    const getUserSql = global.db.prepare('SELECT user.id as userid, username, epost, ' + 
        'FROM user INNER JOIN role ON user.idRole = role.id WHERE user.id = ?');
    let row = getUserSql.get(info.lastInsertRowid)  
    console.log('row inserted', row)

    return row
}

function getUser(id) {
    const sql = global.db.prepare('SELECT user.id as userid, userName, email, role.name as role ' + 
        'FROM user INNER JOIN role ON user.idRole = role.id WHERE user.id = ?');
    let user = sql.get(id)   
    return user
}

function getUserPassword(username) {
    const sql = global.db.prepare('SELECT password FROM user WHERE username = ?');
    return sql.get(username);
}

function checkUserExists(username) {
    const sql = global.db.prepare('SELECT COUNT(*) as count FROM user WHERE username = ?');
    const result = sql.get(username);
    return result.count > 0;
}

function saveGameSession(userId, score) {
    const sql = global.db.prepare("INSERT INTO scores (user_id, score) VALUES (?, ?)");
    sql.run(userId, score);
}

function getHighScore(userId) {
    const sql = global.db.prepare("SELECT MAX(score) AS high_score FROM scores WHERE user_id = ?");
    return sql.get(userId);
}

function getLeaderboard() {
    const sql = global.db.prepare("SELECT user.userName, MAX(scores.score) AS score FROM scores JOIN user ON scores.user_id = user.id GROUP BY scores.user_id ORDER BY score DESC LIMIT 10");
    return sql.all();
}

function updateHighScore(userId, newScore) {
    const sql = global.db.prepare("UPDATE scores SET score =? WHERE user_id =? AND score <?");
    sql.run(newScore, userId, newScore);
}

function saveGameSession(userId, score) {
    const sql = global.db.prepare("INSERT INTO scores (user_id, score) VALUES (?, ?)");
    sql.run(userId, score);
}

function deleteScore(userId) {
    const sql = global.db.prepare("DELETE FROM scores WHERE user_id = ?");
    sql.run(userId);
}

module.exports = {
    saveGameSession,
    deleteScore,
    getHighScore,
    getLeaderboard
};



module.exports = {
    updateHighScore,
    saveGameSession,
    getHighScore,
    getLeaderboard,
    getUser,
    addUser,
    getUserPassword,
    checkUserExists
};

