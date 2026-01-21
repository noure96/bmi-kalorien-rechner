const authBtn = document.getElementById('authBtn');

// Prüfen, ob der Benutzer eingeloggt ist
function updateAuthButton() {
    if (sessionStorage.getItem('loggedIn') === 'true') {
        authBtn.textContent = 'Logout';
        authBtn.onclick = () => {
            sessionStorage.removeItem('loggedIn');
            // Seite neu laden, um Button wieder auf Login zu setzen
            window.location.reload();
        };
    } else {
        authBtn.textContent = 'Login';
        authBtn.onclick = () => {
            // Setze Marker, dass Login von hier gestartet wird
            sessionStorage.setItem('fromBMI', 'true');
            window.location.href = 'login.html';
        };
    }
}

// Beim Laden der Seite Button anpassen
updateAuthButton();
