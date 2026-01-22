document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const page = location.pathname.split("/").pop();

    // Login-Seite niemals blockieren
    if (page === "login.html") return;

    // Kein Token → IMMER Login
    if (!token) {
        location.href = "login.html";
        return;
    }

    // Token beim Server prüfen
    try {
        const res = await fetch("/api/checkLogin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token })
        });

        const data = await res.json();

        if (!data.valid) {
            localStorage.clear();
            location.href = "login.html";
            return;
        }

        // Token erneuern
        localStorage.setItem("token", data.newToken);

    } catch {
        // Server nicht erreichbar → sicherheitshalber raus
        localStorage.clear();
        location.href = "login.html";
    }
});
