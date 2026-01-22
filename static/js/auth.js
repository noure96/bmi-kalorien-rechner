document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('authBtn');

    function updateAuthButton() {
        const token = localStorage.getItem('token');

        if (token) {
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
                } catch {}

                // 🔥 ALLES zurücksetzen
                localStorage.clear();
                sessionStorage.clear();

                // Formular & Ergebnis löschen
                document.getElementById("rechner-form").reset();
                document.getElementById("ergebnis").innerHTML = "";
                document.getElementById("ergebnis").style.display = "none";

                // Immer auf Login
                window.location.href = "login.html";
            };

        } else {
            authBtn.textContent = 'Login';
            authBtn.style.backgroundColor = '';
            authBtn.style.color = '';

            authBtn.onclick = () => {
                window.location.href = 'login.html';
            };
        }
    }

    updateAuthButton();
});
