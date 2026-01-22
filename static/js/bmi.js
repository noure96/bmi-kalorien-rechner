const form = document.getElementById("rechner-form");
const ergebnisDiv = document.getElementById("ergebnis");

form.addEventListener("submit", async e => {
    e.preventDefault();

    const groesse = Number(document.getElementById("groesse").value);
    const gewicht = Number(document.getElementById("gewicht").value);
    const alter = Number(document.getElementById("alter").value);
    const geschlecht = document.getElementById("geschlecht").value;
    const aktivitaet = Number(document.getElementById("aktivitaet").value);

    if(!groesse || !gewicht || !alter) return;

    const bmi = gewicht / ((groesse / 100) ** 2);
    const grundumsatz = geschlecht === "maennlich"
        ? 10 * gewicht + 6.25 * groesse - 5 * alter + 5
        : 10 * gewicht + 6.25 * groesse - 5 * alter - 161;

    const kalorien = Math.round(grundumsatz * aktivitaet);

    ergebnisDiv.style.display = "block";
    ergebnisDiv.innerHTML = `
        <p><strong>BMI:</strong> ${bmi.toFixed(1)}</p>
        <p><strong>Kalorienbedarf:</strong> ${kalorien} kcal</p>
    `;

    // Speichern im Profil
    const token = localStorage.getItem("token");
    if(!token) return;

    await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token,
            height: groesse,
            weight: gewicht,
            age: alter,
            gender: geschlecht,
            activity: aktivitaet,
            bmi: bmi.toFixed(1),
            calories: kalorien
        })
    });
});

// Daten beim Laden wiederherstellen
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if(!token) return;

    const res = await fetch("/api/profile/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    });

    if(!res.ok) return;
    const data = await res.json();
    if(!data.success || !data.profile) return;

    const p = data.profile;

    document.getElementById("groesse").value = p.height || "";
    document.getElementById("gewicht").value = p.weight || "";
    document.getElementById("alter").value = p.age || "";
    document.getElementById("geschlecht").value = p.gender || "maennlich";
    document.getElementById("aktivitaet").value = p.activity || 1.2;

    if(p.bmi && p.calories){
        ergebnisDiv.style.display = "block";
        ergebnisDiv.innerHTML = `
            <p><strong>BMI:</strong> ${p.bmi}</p>
            <p><strong>Kalorienbedarf:</strong> ${p.calories} kcal</p>
        `;
    }
});
