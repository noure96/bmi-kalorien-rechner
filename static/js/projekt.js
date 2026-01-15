const form = document.getElementById("rechner-form");
const ergebnisDiv = document.getElementById("ergebnis");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const groesse = Number(document.getElementById("groesse").value);
    const gewicht = Number(document.getElementById("gewicht").value);
    const alter = Number(document.getElementById("alter").value);
    const geschlecht = document.getElementById("geschlecht").value;
    const aktivitaet = Number(document.getElementById("aktivitaet").value);

    const groesseInMeter = groesse / 100;
    const bmi = gewicht / (groesseInMeter * groesseInMeter);

    let grundumsatz;

    if (geschlecht === "maennlich") {
        grundumsatz = 10 * gewicht + 6.25 * groesse - 5 * alter + 5;
    } else {
        grundumsatz = 10 * gewicht + 6.25 * groesse - 5 * alter - 161;
    }

    const kalorien = grundumsatz * aktivitaet;

    ergebnisDiv.innerHTML = `
        <p>BMI: ${bmi.toFixed(1)}</p>
        <p>Kalorienbedarf: ${Math.round(kalorien)} kcal / Tag</p>
    `;
});
