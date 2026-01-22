const form = document.getElementById("rechner-form");
const ergebnisDiv = document.getElementById("ergebnis");

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) loadProfile();
});

async function loadProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const res = await fetch('/api/profile/get', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ token })
    });

    const data = await res.json();
    if (!data.success) return;

    const p = data.profile;

    groesse.value = p.height;
    gewicht.value = p.weight;
    alter.value = p.age;
    geschlecht.value = p.gender;
    aktivitaet.value = p.activity;

    ergebnisDiv.style.display = 'block';
    ergebnisDiv.innerHTML = `
        <p>BMI: ${p.bmi}</p>
        <p>Kalorienbedarf: ${p.calories} kcal / Tag</p>
    `;
}

form.addEventListener("submit", e => {
    e.preventDefault();

    const g = +groesse.value;
    const w = +gewicht.value;
    const a = +alter.value;
    const sex = geschlecht.value;
    const act = +aktivitaet.value;

    const bmi = w / ((g/100)**2);
    const grund = sex === "maennlich"
        ? 10*w + 6.25*g - 5*a + 5
        : 10*w + 6.25*g - 5*a - 161;

    const kcal = grund * act;

    ergebnisDiv.style.display = 'block';
    ergebnisDiv.innerHTML = `
        <p>BMI: ${bmi.toFixed(1)}</p>
        <p>Kalorienbedarf: ${Math.round(kcal)} kcal / Tag</p>
    `;

    const token = localStorage.getItem('token');
    if (token) {
        fetch('/api/profile/save', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                token,
                height:g,
                weight:w,
                age:a,
                gender:sex,
                activity:act,
                bmi:bmi.toFixed(1),
                calories:Math.round(kcal)
            })
        });
    }
});
