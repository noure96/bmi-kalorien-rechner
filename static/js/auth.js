// Login-Button nur für freiwilliges Einloggen
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        // Markiere, dass Login von hier aus gestartet wurde
        sessionStorage.setItem('fromBMI', 'true');
        // Weiterleitung
        window.location.href = 'login.html';
    });
}
