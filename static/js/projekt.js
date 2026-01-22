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

    const data = await res.json();
    if (!data.success || !data.profile) return;

    const { height, weight, age, gender, activity, bmi, calories } = data.profile;

    groesse.value = height;
    gewicht.value = weight;
    alter.value = age;
    geschlecht.value = gender;
    aktivitaet.value = activity;

    ergebnisDiv.innerHTML = `
        <p>BMI: ${bmi}</p>
        <p>Kalorienbedarf: ${calories} kcal</p>
    `;
}

form.addEventListener("submit", async e => {
    e.preventDefault();

    const groesseM = groesse.value / 100;
    const bmi = gewicht.value / (groesseM * groesseM);

    ergebnisDiv.innerHTML = `<p>BMI: ${bmi.toFixed(1)}</p>`;
});
