document.addEventListener("DOMContentLoaded", async () => {
    const groesse = document.getElementById("groesse");
    const gewicht = document.getElementById("gewicht");
    const alter = document.getElementById("alter");
    const geschlecht = document.getElementById("geschlecht");
    const aktivitaet = document.getElementById("aktivitaet");
    const ergebnisDiv = document.getElementById("ergebnis");
    const authBtn = document.getElementById("authBtn");

    const token = localStorage.getItem("token");

    if (token) {
        authBtn.textContent = "Logout";
        authBtn.style.backgroundColor = "red";
    }

    authBtn.onclick = async () => {
        if (authBtn.textContent === "Login") return location.href = "login.html";

        await fetch("/api/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token })
        });

        localStorage.clear();
        groesse.value = "";
        gewicht.value = "";
        alter.value = "";
        geschlecht.value = "maennlich";
        aktivitaet.value = "1.2";
        ergebnisDiv.style.display = "none";

        location.reload();
    };

    // Profil laden
    if (token) {
        try {
            const res = await fetch("/api/profile/get", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });
            const data = await res.json();
            if (data.success && data.profile) {
                const p = data.profile;
                groesse.value = p.height || "";
                gewicht.value = p.weight || "";
                alter.value = p.age || "";
                geschlecht.value = p.gender || "maennlich";
                aktivitaet.value = p.activity || "1.2";

                if (p.bmi) {
                    ergebnisDiv.style.display = "block";
                    ergebnisDiv.innerHTML = `
                        <p>BMI: ${p.bmi}</p>
                        <p>Kalorienbedarf: ${p.calories} kcal</p>
                    `;
                }
            }
        } catch {}
    }

    // Berechnen
    document.getElementById("rechner-form").addEventListener("submit", async e => {
        e.preventDefault();
        const h = Number(groesse.value);
        const w = Number(gewicht.value);
        const a = Number(alter.value);
        const g = geschlecht.value;
        const act = Number(aktivitaet.value);

        const bmi = (w / ((h / 100) ** 2)).toFixed(1);
        const grundumsatz = g === "maennlich"
            ? 10*w + 6.25*h - 5*a + 5
            : 10*w + 6.25*h - 5*a - 161;
        const kcal = Math.round(grundumsatz * act);

        ergebnisDiv.style.display = "block";
        ergebnisDiv.innerHTML = `<p>BMI: ${bmi}</p><p>Kalorienbedarf: ${kcal} kcal</p>`;

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
                bmi,
                calories: kcal
            })
        });
    });
});
