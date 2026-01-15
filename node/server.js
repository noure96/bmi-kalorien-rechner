// Node Module importieren
var http = require('http');
var fs = require('fs');
var path = require('path');
var crypto = require("crypto");

// Konfiguration
var PORT = 3000;
var STATIC_DIR = path.join(__dirname, '../static');

// ===== HILFSFUNKTIONEN =====

// JSON Body auslesen (hilfsfunktion)
function readRequestBody(request, callback) {
    var body = "";
    request.on("data", function(chunk) {
        body += chunk;
    });
    request.on("end", function() {
        try {
            var jsonData = JSON.parse(body);
            callback(null, jsonData);
        } catch (error) {
            callback(error, null);
        }
    });
}

// JSON Antwort senden
function sendJson(response, statusCode, dataObject) {
    response.writeHead(statusCode, { 'Content-Type': 'application/json' });
    var jsonString = JSON.stringify(dataObject);
    response.write(jsonString);
    response.end();
}

// HTML Antwort senden
function sendHtml(response, statusCode, htmlString) {
    response.writeHead(statusCode, { 'Content-Type': 'text/html' });
    response.write(htmlString);
    response.end();
}

// Aktuelle Uhrzeit erzeugen
function getCurrentTime() {
    return new Date().toLocaleTimeString();
}

// ===== LOGIN / TOKEN STORAGE =====
var activeTokens = {};

// Token erzeugen
function generateToken() {
    return crypto.randomBytes(32).toString("hex").toUpperCase();
}

// ===== SECURITY FUNKTIONEN =====

// Passwort hashen
function hashPassword(plainPassword) {
    const salt = crypto.randomBytes(16).toString('hex'); // 32 Zeichen Salt
    const hash = crypto
        .pbkdf2Sync(plainPassword, salt, 10000, 64, 'sha512')
        .toString('hex');

    return { salt: salt, hash: hash };
}

// Passwort prüfen
function verifyPassword(plainPassword, storedSalt, storedHash) {
    const hashCheck = crypto
        .pbkdf2Sync(plainPassword, storedSalt, 10000, 64, 'sha512')
        .toString('hex');

    return hashCheck === storedHash;
}

// ===== INITIAL USER SETUP =====
var user = "admin";
var password = "123456";
var hashedPassword = hashPassword(password);

// ===== API FUNKTIONEN =====

// API: /api/time
function handleTimeApi(request, response) {
    var result = { time: getCurrentTime() };
    sendJson(response, 200, result);
}

// API: /api/data
function handleDataApi(request, response) {
    if (request.method !== "POST") {
        response.writeHead(405, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Only POST allowed" }));
        return;
    }

    readRequestBody(request, function(error, dataObject) {
        if (error) {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Invalid JSON" }));
            return;
        }

        var wert1 = dataObject.wert1;
        var wert2 = dataObject.wert2;
        var wert3 = dataObject.wert3;

        var ergebnis = "Muss noch berechnet werden";

        var responseData = {
            message: "Das Ergebnis ist:",
            received: { ergebnis: ergebnis }
        };

        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(responseData));
    });
}

// API: /api/checkLogin
function handleCheckLoginApi(request, response) {
    if (request.method !== "POST") {
        sendJson(response, 405, { valid: false, error: "Only POST allowed" });
        return;
    }

    readRequestBody(request, function(error, data) {
        if (error || !data.token) {
            sendJson(response, 400, { valid: false, error: "Token fehlt oder ungültig" });
            return;
        }

        var oldToken = data.token;

        if (!activeTokens[oldToken]) {
            sendJson(response, 401, { valid: false, error: "Token ungültig" });
            return;
        }

        var newToken = generateToken();
        delete activeTokens[oldToken];
        activeTokens[newToken] = true;

        sendJson(response, 200, { valid: true, newToken: newToken });
    });
}

// API: /api/login
function handleLoginApi(request, response) {
    if (request.method !== "POST") {
        sendJson(response, 405, { success: false, error: "Only POST allowed" });
        return;
    }

    readRequestBody(request, function(error, data) {
        if (error || !data.username || !data.password) {
            sendJson(response, 400, { success: false, error: "Ungültige Anfrage" });
            return;
        }

        var usernameInput = data.username;
        var passwordInput = data.password;

        // Prüfen ob Username stimmt
        if (usernameInput !== user) {
            sendJson(response, 401, { success: false, error: "Login fehlgeschlagen" });
            return;
        }

        // Passwort prüfen
        if (!verifyPassword(passwordInput, hashedPassword.salt, hashedPassword.hash)) {
            sendJson(response, 401, { success: false, error: "Login fehlgeschlagen" });
            return;
        }

        // Token erzeugen
        var token = generateToken();
        activeTokens[token] = true;

        sendJson(response, 200, { success: true, token: token });
    });
}

// ===== STATISCHE DATEIEN =====
function getContentType(filePath) {
    var ext = path.extname(filePath);
    if (ext === '.html') return 'text/html';
    if (ext === '.js') return 'text/javascript';
    if (ext === '.css') return 'text/css';
    return 'text/plain';
}

function serveStaticFile(request, response) {
    var filePath = (request.url === '/') 
        ? path.join(STATIC_DIR, 'index.html') 
        : path.join(STATIC_DIR, request.url);

    fs.readFile(filePath, function(error, data) {
        if (error) {
            sendHtml(response, 404, '<h1>404 - Datei nicht gefunden</h1>');
            return;
        }

        var contentType = getContentType(filePath);
        response.writeHead(200, { 'Content-Type': contentType });
        response.write(data);
        response.end();
    });
}

// ===== ROUTER =====
function routeRequest(request, response) {
    if (request.url === '/api/time') { handleTimeApi(request, response); return; }
    if (request.url === '/api/data') { handleDataApi(request, response); return; }
    if (request.url === '/api/checkLogin') { handleCheckLoginApi(request, response); return; }
    if (request.url === '/api/login' && request.method === "POST") { handleLoginApi(request, response); return; }

    serveStaticFile(request, response);
}

// ===== SERVER =====
var server = http.createServer(function(request, response) {
    routeRequest(request, response);
});

server.listen(PORT, function() {
    console.log('Server läuft auf http://localhost:' + PORT);
});
