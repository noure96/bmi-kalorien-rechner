// Beim Laden prüfen, ob Token vorhanden ist und BMI freischalten
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) unlockBMI();
});

// UI freischalten nach Login
function unlockBMI() {
    // Falls Login-Form vorhanden (login.html) → ausblenden
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.style.display = 'none';
    document.getElementById('bmiSection').style.display = 'block';
    loadProfile(); // Profil laden
}

// Fehler anzeigen
function showError(msg) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) errorDiv.textContent = msg;
}

// Profil laden
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

        document.getElementById("ergebnis").innerHTML = `
            <p>BMI: ${bmi}</p>
            <p>Kalorienbedarf: ${calories} kcal / Tag</p>
        `;
    } catch (e) {
        console.error("Profil konnte nicht geladen werden", e);
    }
}

// BMI & Kalorienrechner
const form = document.getElementById("rechner-form");
const ergebnisDiv = document.getElementById("ergebnis");

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

    // Optional: Profil speichern, falls eingeloggt
    const token = localStorage.getItem('token');
    if (token) {
        fetch('/api/profile/save', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                token,
                height: groesse,
                weight: gewicht,
                age: alter,
                gender: geschlecht,
                activity: aktivitaet,
                bmi: bmi.toFixed(1),
                calories: Math.round(kalorien)
            })
        });
    }
});
