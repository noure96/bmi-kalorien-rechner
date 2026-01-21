const form = document.getElementById("rechner-form");
const ergebnisDiv = document.getElementById("ergebnis");

// Beim Laden prüfen, ob der Benutzer eingeloggt ist und Profil laden
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) loadProfile();
});

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

        // Werte ins Formular eintragen
        document.getElementById("groesse").value = height;
        document.getElementById("gewicht").value = weight;
        document.getElementById("alter").value = age;
        document.getElementById("geschlecht").value = gender;
        document.getElementById("aktivitaet").value = activity;

        // Ergebnis anzeigen
        ergebnisDiv.style.display = 'block';
        ergebnisDiv.innerHTML = `
            <p>BMI: ${bmi}</p>
            <p>Kalorienbedarf: ${calories} kcal / Tag</p>
        `;
    } catch (e) {
        console.error("Profil konnte nicht geladen werden", e);
    }
}

// BMI & Kalorien Berechnung + Speichern
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
        grundumsatz = 10*gewicht + 6.25*groesse - 5*alter + 5;
    else
        grundumsatz = 10*gewicht + 6.25*groesse - 5*alter - 161;

    const kalorien = grundumsatz * aktivitaet;

    // Ergebnis anzeigen
    ergebnisDiv.style.display = 'block';
    ergebnisDiv.innerHTML = `
        <p>BMI: ${bmi.toFixed(1)}</p>
        <p>Kalorienbedarf: ${Math.round(kalorien)} kcal / Tag</p>
    `;

    // Profil speichern, falls eingeloggt
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
