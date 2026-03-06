const body = document.body;
const modeToggle = document.querySelector(".dark-light");
const searchToggle = document.querySelector(".searchToggle");
const searchField = document.querySelector(".search-field");
const searchInput = document.getElementById("searchInput");
const nav = document.querySelector("nav");
const sidebarOpen = document.querySelector(".siderbarOpen");
const sidebarClose = document.querySelector(".siderbarClose");

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImage");
const closeBtn = document.querySelector(".close");
const stickerContainer = document.getElementById("stickerContainer");

// =======================
// DARK MODE
// =======================
if (localStorage.getItem("mode") === "dark-mode") {
    body.classList.add("dark");
    if (modeToggle) modeToggle.classList.add("active"); // ensure sun/moon icons match mode
}

if (modeToggle) {
    modeToggle.addEventListener("click", () => {
        modeToggle.classList.toggle("active"); // toggle sun/moon icons
        body.classList.toggle("dark");         // toggle dark mode

        if (body.classList.contains("dark")) {
            localStorage.setItem("mode", "dark-mode");
        } else {
            localStorage.setItem("mode", "light-mode");
        }
    });
}

// =======================
// SEARCH TOGGLE
// =======================
if (searchToggle) {
    searchToggle.addEventListener("click", () => {
        searchToggle.classList.toggle("active"); // toggle search/X icons
        if (searchField) searchField.classList.toggle("active"); // show/hide input
    });
}

// =======================
// SIDEBAR
// =======================
if (sidebarOpen) {
    sidebarOpen.addEventListener("click", () => {
        nav.classList.add("active");
    });
}

if (sidebarClose) {
    sidebarClose.addEventListener("click", () => {
        nav.classList.remove("active");
    });
}

// =======================
// LIVE SEARCH
// =======================
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll(".card").forEach(card => {
            const title = card.querySelector("h3").innerText.toLowerCase();
            card.style.display = title.includes(term) ? "block" : "none";
        });
    });
}

// =======================
// MODAL SECTION
// =======================

// Open modal when clicking image
if (stickerContainer) {
    stickerContainer.addEventListener("click", (e) => {
        if (e.target.tagName === "IMG") {
            modal.classList.add("active");
            modalImg.src = e.target.src;
        }
    });
}

// Close with X button
if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });
}

// Close when clicking outside image
if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });
}

// Close with ESC key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        modal.classList.remove("active");
    }
});