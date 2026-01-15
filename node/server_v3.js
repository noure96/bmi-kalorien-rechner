// Ihr seht, dass euer Code überarbeitet wurde... 
// Es wurden einige Funktionen hinzugefügt und vieles umstrukturiert.
// Ihr findet die neue Datei server.js im Teams Ordner. 


// Node Module importieren
var http = require('http');
var fs = require('fs');
var path = require('path');

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
    
    // JSON.stringify(dataObject);
    // Converts a JavaScript value to a JavaScript Object Notation (JSON) string.

    response.writeHead(statusCode, {
        'Content-Type': 'application/json'
    });
    var jsonString = JSON.stringify(dataObject);
    response.write(jsonString);
    response.end();
}

// HTML Antwort senden
function sendHtml(response, statusCode, htmlString) {
    response.writeHead(statusCode, {
        'Content-Type': 'text/html'
    });
    response.write(htmlString);
    response.end();
}

// Aktuelle Uhrzeit erzeugen (reine Funktion)
function getCurrentTime() {
    return new Date().toLocaleTimeString();
}


// ===== API FUNKTIONEN =====

// API: /api/time
function handleTimeApi(request, response) {
    var result = {
        time: getCurrentTime(),
    };

    sendJson(response, 200, result);
}

// API: /api/data

function handleDataApi(request, response) {

    // Nur POST zulassen
    if (request.method !== "POST") {
        response.writeHead(405, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Only POST allowed" }));
        return;
    }

    // Body lesen
    readRequestBody(request, function(error, dataObject) {

        if (error) {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Invalid JSON" }));
            return;
        }

        // Erwartete Werte extrahieren
        var wert1 = dataObject.wert1;
        var wert2 = dataObject.wert2;
        var wert3 = dataObject.wert3;


        var ergebnis = "Muss noch berechnet werden"

        // Beispiel-Antwort (du kannst auch speichern oder weiterverarbeiten)
        var responseData = {
            message: "Das Ergebnis ist:",
            received: {
                ergebnis: ergebnis,
            }
        };

        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(responseData));
    });
}


// ===== STATISCHE DATEIEN =====

function getContentType(filePath) {
    var ext = path.extname(filePath);

    if (ext === '.html') {
        return 'text/html';
    }
    if (ext === '.js') {
        return 'text/javascript';
    }
    if (ext === '.css') {
        return 'text/css';
    }

    return 'text/plain';
}

function serveStaticFile(request, response) {
    var filePath;

    if (request.url === '/') {
        filePath = path.join(STATIC_DIR, 'index.html');
    } else {
        filePath = path.join(STATIC_DIR, request.url);
    }

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

    if (request.url === '/api/time') {
        handleTimeApi(request, response);
        return;
    }

    if (request.url === '/api/data') {
        handleDataApi(request, response);
        return;
    }


    serveStaticFile(request, response);
}


// ===== SERVER =====

var server = http.createServer(function(request, response) {
    routeRequest(request, response);
});

server.listen(PORT, function() {
    console.log('Server läuft auf http://localhost:' + PORT);
});
