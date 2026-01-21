const form = document.getElementById("rechner-form");
const ergebnisDiv = document.getElementById("ergebnis");

form.addEventListener("submit", async e => {
    e.preventDefault();

    const groesse = Number(groesse.value);
    const gewicht = Number(gewicht.value);
    const alter = Number(alter.value);
    const geschlecht = geschlecht.value;
    const aktivitaet = Number(aktivitaet.value);

    const bmi = gewicht / ((groesse / 100) ** 2);

    const grundumsatz =
        geschlecht === "maennlich"
            ? 10 * gewicht + 6.25 * groesse - 5 * alter + 5
            : 10 * gewicht + 6.25 * groesse - 5 * alter - 161;

    const kalorien = Math.round(grundumsatz * aktivitaet);

    ergebnisDiv.innerHTML = `
        <p>BMI: ${bmi.toFixed(1)}</p>
        <p>Kalorienbedarf: ${kalorien} kcal</p>
    `;

    await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token: localStorage.getItem("token"),
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

// 🔁 Beim Laden wiederherstellen
document.addEventListener("DOMContentLoaded", loadProfile);

async function loadProfile() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/profile/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    });

    const data = await res.json();
    if (!data.success || !data.profile) return;

    const p = data.profile;

    groesse.value = p.height;
    gewicht.value = p.weight;
    alter.value = p.age;
    geschlecht.value = p.gender;
    aktivitaet.value = p.activity;

    ergebnisDiv.innerHTML = `
        <p>BMI: ${p.bmi}</p>
        <p>Kalorienbedarf: ${p.calories} kcal</p>
    `;
}
