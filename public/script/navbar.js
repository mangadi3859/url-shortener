const dropdown = document.querySelector("[data-nv-dropdown]");
const logout = document.querySelectorAll("[data-logout]");

dropdown.addEventListener("click", (e) => {
    dropdown.classList.toggle("active");
});

logout.forEach((e) =>
    e.addEventListener("click", (e) => {
        if (!confirm("Are you sure you want to log out?")) return;
        fetch("/api/logout", {
            method: "DELETE",
        })
            .then((res) => res.json())
            .then((r) => {
                if (r.code !== 200) return alert("Failed");
                window.location = window.location.href;
            })
            .catch((e) => {
                alert(e);
            });
    }),
);
