const form = document.getElementById("rechner-form");
const ergebnisDiv = document.getElementById("ergebnis");

document.addEventListener("DOMContentLoaded", loadProfile);

async function loadProfile() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/profile/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    });

    if (!res.ok) return;

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

form.addEventListener("submit", async e => {
    e.preventDefault();

    const h = Number(groesse.value);
    const w = Number(gewicht.value);
    const a = Number(alter.value);
    const g = geschlecht.value;
    const act = Number(aktivitaet.value);

    const bmi = w / ((h / 100) ** 2);

    const grundumsatz =
        g === "maennlich"
            ? 10*w + 6.25*h - 5*a + 5
            : 10*w + 6.25*h - 5*a - 161;

    const kcal = Math.round(grundumsatz * act);

    ergebnisDiv.innerHTML = `
        <p>BMI: ${bmi.toFixed(1)}</p>
        <p>Kalorienbedarf: ${kcal} kcal</p>
    `;

    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token,
            height: h,
            weight: w,
            age: a,
            gender: g,
            activity: act,
            bmi: bmi.toFixed(1),
            calories: kcal
        })
    });
});
