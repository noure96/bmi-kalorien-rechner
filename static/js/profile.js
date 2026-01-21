document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("/api/profile/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: localStorage.getItem("token") })
    });

    const data = await res.json();
    if (!data.success || !data.profile) return;

    profil.innerHTML = `
        <p>Größe: ${data.profile.height} cm</p>
        <p>Gewicht: ${data.profile.weight} kg</p>
        <p>BMI: ${data.profile.bmi}</p>
        <p>Kalorien: ${data.profile.calories} kcal</p>
    `;
});
