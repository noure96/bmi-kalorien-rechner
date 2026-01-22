(function () {
    const token = localStorage.getItem("token");
    const currentPage = location.pathname.split("/").pop();

    // Login-Seite nie blockieren
    if (currentPage === "login.html") return;

    // Kein Token → sofort zu Login
    if (!token) {
        location.replace(
            `login.html?redirect=${encodeURIComponent(currentPage)}`
        );
        return;
    }

    // Token beim Server prüfen
    fetch("/api/checkLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.valid) {
            localStorage.clear();
            location.replace(
                `login.html?redirect=${encodeURIComponent(currentPage)}`
            );
        } else {
            // erneuerten Token speichern
            localStorage.setItem("token", data.newToken);
        }
    })
    .catch(() => {
        localStorage.clear();
        location.replace(
            `login.html?redirect=${encodeURIComponent(currentPage)}`
        );
    });
})();
