// Ihr seht, dass euer Code überarbeitet wurde... 
// Es wurden einige Funktionen hinzugefügt und vieles umstrukturiert.
// Ihr findet die neue Datei server.js im Teams Ordner. 
// Kopiert euch bitte den Inhalt in die von euch gestern erstellte server.js 
// und bearbeitet die Aufgaben:
// 1. Lies den Code gründlich 
// 2. Was hat sich verändert? 
//  Teste die Software manuell:
//    Funktioniert serveStaticFile() und gibt die index.html bei Aufruf der 
//    Basic URL zurück? (localhost:3000 != localhost:3000/index.html)
//    Gibt es eine 404 Meldung wenn die Datei NICHT auffindbar ist zurück?
//    Gibt es weitere Dateien zurück wenn die Datei auffindbar ist? z.B. login.html
// 3. Was findest du jetzt am Code besser? Was nicht? Es ist eine Aufgabe im Code versteckt, 
//    bearbeitet auch diese.
// 4. Bereite dich darauf vor im Anschluss Fragen zu der Software zu beantworten
//    und live Änderungsaufträge zu erhalten.
// 5. Um 09:45 machen wir eine Zwischenbesprechung.


// Node Module importieren
var http = require('http');
var fs = require('fs');
var path = require('path');

// Konfiguration
var PORT = 3000;
var STATIC_DIR = path.join(__dirname, '../static');


// ===== HILFSFUNKTIONEN =====



// HTML Antwort senden
function sendHtml(response, statusCode, htmlString) {
    response.writeHead(statusCode, {
        'Content-Type': 'text/html'
    });
    response.write(htmlString);
    response.end();
}

// Aktuelle Uhrzeit erzeugen
function getCurrentTime() {
    return new Date().toLocaleTimeString();
}


// ===== STATISCHE DATEIEN =====
    // Leider haben die Kollegen hier Content Typen vergessen, 
    // ergänze mindestens einen weiteren Content Typ und fixe das Problem des fehlenden Content Typ.

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
    serveStaticFile(request, response);
}


// ===== SERVER =====

var server = http.createServer(function(request, response) {
    routeRequest(request, response);
});

server.listen(PORT, function() {
    console.log('Server läuft auf http://localhost:' + PORT);
});
