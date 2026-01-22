const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const STATIC_DIR = path.join(__dirname, '../static');
const TOKEN_LIFETIME = 30 * 60 * 1000;

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
    return crypto.randomBytes(32).toString('hex');
}

function storeToken(token, username) {
    activeTokens[token] = { username, createdAt: Date.now() };
}

function isTokenValid(token) {
    return activeTokens[token] &&
        Date.now() - activeTokens[token].createdAt < TOKEN_LIFETIME;
}

function cleanupTokens() {
    const now = Date.now();
    for (const t in activeTokens) {
        if (now - activeTokens[t].createdAt > TOKEN_LIFETIME) {
            delete activeTokens[t];
        }
    }
}

// ===== API =====
function handleLoginApi(req, res) {
    readRequestBody(req, (err, data) => {
        if (err) return sendJson(res, 400, { success: false });

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

function handleCheckLoginApi(req, res) {
    readRequestBody(req, (err, data) => {
        cleanupTokens();
        if (!data?.token || !isTokenValid(data.token))
            return sendJson(res, 401, { valid: false });

        const username = activeTokens[data.token].username;
        delete activeTokens[data.token];
        const newToken = generateToken();
        storeToken(newToken, username);

        sendJson(res, 200, { valid: true, newToken });
    });
}

function handleLogoutApi(req, res) {
    readRequestBody(req, (_, data) => {
        if (data?.token) delete activeTokens[data.token];
        sendJson(res, 200, { success: true });
    });
}

function handleSaveProfileApi(req, res) {
    readRequestBody(req, (err, data) => {
        if (err) return sendJson(res, 400, { success: false });

        const tokenData = activeTokens[data.token];
        if (!tokenData) return sendJson(res, 401, { success: false });

        const users = loadUsers();
        users[tokenData.username].profile = {
            height: data.height,
            weight: data.weight,
            age: data.age,
            gender: data.gender,
            activity: data.activity,
            bmi: data.bmi,
            calories: data.calories
        };
        saveUsers(users);
        sendJson(res, 200, { success: true });
    });
}

function handleGetProfileApi(req, res) {
    readRequestBody(req, (err, data) => {
        const tokenData = activeTokens[data.token];
        if (!tokenData) return sendJson(res, 401, { success: false });

        const users = loadUsers();
        sendJson(res, 200, {
            success: true,
            profile: users[tokenData.username].profile
        });
    });
}

// ===== Static =====
function serveStatic(req, res) {
    const cleanUrl = req.url.split('?')[0];
    const filePath = cleanUrl === '/'
        ? path.join(STATIC_DIR, 'login.html')
        : path.join(STATIC_DIR, cleanUrl);

    fs.readFile(filePath, (err, data) => {
        if (err) return sendHtml(res, 404, '404');
        res.writeHead(200);
        res.end(data);
    });
}

// ===== Router =====
function router(req, res) {
    if (req.url === '/api/login') return handleLoginApi(req, res);
    if (req.url === '/api/checkLogin') return handleCheckLoginApi(req, res);
    if (req.url === '/api/logout') return handleLogoutApi(req, res);
    if (req.url === '/api/profile/save') return handleSaveProfileApi(req, res);
    if (req.url === '/api/profile/get') return handleGetProfileApi(req, res);
    serveStatic(req, res);
}

// ===== Start =====
http.createServer(router).listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
