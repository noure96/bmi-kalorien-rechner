(function () {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username") || "";
    const currentPage = location.pathname.split("/").pop();

    const authBtn = document.getElementById("authBtn");

    // Login-Seite nie blockieren
    if (currentPage === "login.html") return;

    // Kein Token → sofort zu Login
    if (!token) {
        if(authBtn) authBtn.textContent = "Login";
        location.replace(`login.html?redirect=${encodeURIComponent(currentPage)}`);
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
            if(authBtn) authBtn.textContent = "Login";
            location.replace(`login.html?redirect=${encodeURIComponent(currentPage)}`);
        } else {
            // erneuerten Token speichern
            localStorage.setItem("token", data.newToken);
            if(authBtn) {
                authBtn.textContent = "Logout";
                authBtn.style.backgroundColor = "red";
            }
            if(document.getElementById("usernameDisplay") && username) {
                document.getElementById("usernameDisplay").textContent = username;
            }
        }
    })
    .catch(() => {
        localStorage.clear();
        if(authBtn) authBtn.textContent = "Login";
        location.replace(`login.html?redirect=${encodeURIComponent(currentPage)}`);
    });

    // Button Login/Logout
    if(authBtn) {
        authBtn.onclick = async () => {
            if(localStorage.getItem("token")) {
                // Logout
                try {
                    await fetch("/api/logout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token: localStorage.getItem("token") })
                    });
                } catch {}
                localStorage.removeItem("token");
                authBtn.textContent = "Login";
                authBtn.style.backgroundColor = "blue";
                // Rechner reseten, aber Userdaten bleiben
                const form = document.getElementById("rechner-form");
                if(form) form.reset();
                const ergebnisDiv = document.getElementById("ergebnis");
                if(ergebnisDiv) ergebnisDiv.style.display = "none";
            } else {
                location.href = "login.html";
            }
        }
    }
})();
