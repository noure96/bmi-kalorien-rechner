const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const STATIC_DIR = path.join(__dirname, '../static');
const TOKEN_LIFETIME = 30 * 60 * 1000; // 30 Minuten

// ===== Helpers =====
function readRequestBody(req, callback) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try { callback(null, JSON.parse(body)); } 
        catch { callback(true, null); }
    });
}

function sendJson(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function sendHtml(res, status, html) {
    res.writeHead(status, { 'Content-Type': 'text/html' });
    res.end(html);
}

// ===== Security =====
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function verifyPassword(password, salt, hash) {
    const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return check === hash;
}

// ===== Users =====
const USERS_FILE = path.join(__dirname, 'users.json');

function loadUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ===== Token =====
let activeTokens = {};

function generateToken() {
    return crypto.randomBytes(32).toString('hex').toUpperCase();
}

function storeToken(token, username) {
    activeTokens[token] = { username, createdAt: Date.now() };
}

function isTokenValid(token) {
    if (!activeTokens[token]) return false;
    return (Date.now() - activeTokens[token].createdAt) < TOKEN_LIFETIME;
}

function cleanupTokens() {
    const now = Date.now();
    for (const token in activeTokens) {
        if ((now - activeTokens[token].createdAt) > TOKEN_LIFETIME) {
            delete activeTokens[token];
        }
    }
}

// ===== API =====

// LOGIN
function handleLoginApi(req, res) {
    if (req.method !== 'POST') return sendJson(res, 405, { success: false });

    readRequestBody(req, (err, data) => {
        if (err || !data.username || !data.password) return sendJson(res, 400, { success: false });

        const users = loadUsers();
        const user = users[data.username];
        if (!user) return sendJson(res, 401, { success: false });

        if (!verifyPassword(data.password, user.password.salt, user.password.hash)) 
            return sendJson(res, 401, { success: false });

        const token = generateToken();
        storeToken(token, data.username);

        sendJson(res, 200, { success: true, token });
    });
}

// TOKEN CHECK
function handleCheckLoginApi(req, res) {
    if (req.method !== 'POST') return sendJson(res, 405, { valid: false });
    readRequestBody(req, (err, data) => {
        if (err || !data.token) return sendJson(res, 400, { valid: false });

        cleanupTokens();
        if (!isTokenValid(data.token)) {
            delete activeTokens[data.token];
            return sendJson(res, 401, { valid: false });
        }

        // Erneuern
        const username = activeTokens[data.token].username;
        delete activeTokens[data.token];
        const newToken = generateToken();
        storeToken(newToken, username);

        sendJson(res, 200, { valid: true, newToken, expiresIn: TOKEN_LIFETIME });
    });
}

// LOGOUT
function handleLogoutApi(req, res) {
    readRequestBody(req, (_, data) => {
        if (data?.token) delete activeTokens[data.token];
        sendJson(res, 200, { success: true });
    });
}

// PROFILE SAVE
function handleSaveProfileApi(req, res) {
    readRequestBody(req, (err, data) => {
        if (err || !data.token || !data.height || !data.weight || !data.age || !data.gender || !data.activity || !data.bmi || !data.calories) return sendJson(res, 400, { success: false });
        const tokenData = activeTokens[data.token];
        if (!tokenData) return sendJson(res, 401, { success: false });

        const users = loadUsers();
        const user = users[tokenData.username];

        const heightM = data.height / 100;
        const bmi = (data.weight / (heightM * heightM)).toFixed(2);

        user.profile = { height: data.height, weight: data.weight, age: data.age, gender: data.gender, activity: data.activity, bmi: bmi, calories: data.calories };
        saveUsers(users);

        sendJson(res, 200, { success: true, bmi });
    });
}

// PROFILE GET
function handleGetProfileApi(req, res) {
    readRequestBody(req, (err, data) => {
        if (err || !data.token) return sendJson(res, 400, { success: false });
        const tokenData = activeTokens[data.token];
        if (!tokenData) return sendJson(res, 401, { success: false });

        const users = loadUsers();
        const profile = users[tokenData.username].profile;
        sendJson(res, 200, { success: true, profile });
    });
}

const username = 'admin'; // Benutzername
const newPassword = '123456'; // neues Passwort
const file = './node/users.json';

// Salt & Hash erstellen
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(newPassword, salt, 10000, 64, 'sha512').toString('hex');

// JSON laden
const users = JSON.parse(fs.readFileSync(file, 'utf8'));
users[username].password = { salt, hash };

// Speichern
fs.writeFileSync(file, JSON.stringify(users, null, 2));
console.log(`Passwort für ${username} wurde gesetzt!`);


// ===== STATIC FILES =====
function getContentType(file) {
    const ext = path.extname(file);
    if (ext === '.html') return 'text/html';
    if (ext === '.js') return 'text/javascript';
    if (ext === '.css') return 'text/css';
    return 'text/plain';
}

function serveStatic(req, res) {
    const cleanUrl = req.url.split('?')[0]; // ← DAS FEHLTE
    const filePath =
        cleanUrl === '/'
            ? path.join(STATIC_DIR, 'login.html')
            : path.join(STATIC_DIR, cleanUrl);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error("404:", filePath);
            return sendHtml(res, 404, '<h1>404 - Not Found</h1>');
        }

        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(data);
    });
}


// ===== ROUTER =====
function router(req, res) {
    if (req.url === '/api/login') return handleLoginApi(req, res);
    if (req.url === '/api/checkLogin') return handleCheckLoginApi(req, res);
    if (req.url === '/api/logout') return handleLogoutApi(req, res);
    if (req.url === '/api/profile/save') return handleSaveProfileApi(req, res);
    if (req.url === '/api/profile/get') return handleGetProfileApi(req, res);
    serveStatic(req, res);
}

// ===== SERVER START =====
http.createServer(router).listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
