const authBtn = document.getElementById('authBtn');

function updateAuthButton() {
    const token = localStorage.getItem('token');

    if (token) {
        // Benutzer ist eingeloggt → Button zeigt Logout
        authBtn.textContent = 'Logout';
        authBtn.style.backgroundColor = 'red';
        authBtn.style.color = 'white';
        authBtn.onclick = async () => {
            try {
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
            } catch (e) {
                console.warn("Server Logout fehlgeschlagen", e);
            }

            // Token und Marker löschen
            localStorage.removeItem('token');
            sessionStorage.removeItem('fromBMI');

            // Button zurücksetzen auf Login
            authBtn.textContent = 'Login';
            authBtn.style.backgroundColor = '';
            authBtn.style.color = '';
            authBtn.onclick = () => {
                sessionStorage.setItem('fromBMI', 'true');
                window.location.href = 'login.html';
            };
        };
    } else {
        // Benutzer nicht eingeloggt → Button zeigt Login
        authBtn.textContent = 'Login';
        authBtn.style.backgroundColor = '';
        authBtn.style.color = '';
        authBtn.onclick = () => {
            sessionStorage.setItem('fromBMI', 'true');
            window.location.href = 'login.html';
        };
    }
}

// Initial aufrufen, sobald die Seite geladen wird
document.addEventListener('DOMContentLoaded', updateAuthButton);
