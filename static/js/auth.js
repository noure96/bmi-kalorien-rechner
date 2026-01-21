document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    // Seiten die Login brauchen
    const protectedPages = [
        "index.html",
        "bmirechner.html",
        "profil.html",
        "daten.html"
    ];

    const currentPage = location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage) && !token) {
        location.href = "login.html";
    }
});
