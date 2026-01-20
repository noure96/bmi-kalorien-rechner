// LOGIN
document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const loginData = {
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value
    };
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(loginData)
        });
        if (!res.ok) throw new Error('HTTP Fehler');
        const data = await res.json();
        if (data.success && data.token) {
            localStorage.setItem('token', data.token);
            unlockBMI();
        } else showError('Ungültige Login-Daten.');
    } catch { showError('Serverfehler'); }
});

// UI freischalten
function unlockBMI() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('bmiSection').style.display = 'block';
    loadProfile(); // Profil laden
}


// Fehler anzeigen
function showError(msg) {
    document.getElementById('error').textContent = msg;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    const token = localStorage.getItem('token');
    fetch('/api/logout', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({token})
    });
    localStorage.removeItem('token');
    location.reload();
});

// Beim Laden prüfen
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) unlockBMI();
});

// BMI Rechner
const form = document.getElementById("rechner-form");
const ergebnisDiv = document.getElementById("ergebnis");

async function loadProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await fetch('/api/profile/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });

        if (!res.ok) return;

        const data = await res.json();
        if (!data.success || !data.profile) return;

        const { height, weight, age, gender, activity, bmi, calories } = data.profile;

        document.getElementById("groesse").value = height;
        document.getElementById("gewicht").value = weight;
        document.getElementById("alter").value = age;
        document.getElementById("geschlecht").value = gender;
        document.getElementById("aktivitaet").value = activity;

        ergebnisDiv.innerHTML = `
            <p>BMI: ${bmi}</p>
            <p>Kalorienbedarf: ${calories} kcal / Tag</p>
        `;
    } catch (e) {
        console.error("Profil konnte nicht geladen werden", e);
    }
}

form.addEventListener("submit", function(event) {
    event.preventDefault();
    const groesse = Number(document.getElementById("groesse").value);
    const gewicht = Number(document.getElementById("gewicht").value);
    const alter = Number(document.getElementById("alter").value);
    const geschlecht = document.getElementById("geschlecht").value;
    const aktivitaet = Number(document.getElementById("aktivitaet").value);

    const groesseM = groesse / 100;
    const bmi = gewicht / (groesseM * groesseM);

    let grundumsatz;
    if (geschlecht === "maennlich")
        grundumsatz = 10*gewicht + 6.25*groesse - 5*alter +5;
    else
        grundumsatz = 10*gewicht + 6.25*groesse - 5*alter -161;

    const kalorien = grundumsatz * aktivitaet;

    ergebnisDiv.innerHTML = `
        <p>BMI: ${bmi.toFixed(1)}</p>
        <p>Kalorienbedarf: ${Math.round(kalorien)} kcal / Tag</p>
    `;

    // Optional: Profil speichern
    const token = localStorage.getItem('token');
    fetch('/api/profile/save', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({token, height: groesse, weight: gewicht, age: alter, gender: geschlecht, activity: aktivitaet, bmi: bmi.toFixed(1), calories: Math.round(kalorien)})
    });
});
