const body = document.body;
const modeToggle = document.querySelector(".dark-light");
const searchToggle = document.querySelector(".searchToggle");
const searchInput = document.getElementById("searchInput");
const nav = document.querySelector("nav");
const sidebarOpen = document.querySelector(".siderbarOpen");
const sidebarClose = document.querySelector(".siderbarClose");

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImage");
const closeBtn = document.querySelector(".close");

// Dark Mode
if (localStorage.getItem("mode") === "dark-mode") {
    body.classList.add("dark");
}

modeToggle.addEventListener("click" , () =>{
            modeToggle.classList.toggle("active");
            body.classList.toggle("dark");

            // js code to keep user selected mode even page refresh or file reopen
            if(body.classList.contains("dark")){
                localStorage.setItem("mode" , "dark-mode");
            }else{
                localStorage.setItem("mode" , "light-mode");
            }
        });

// Search Toggle
searchToggle.addEventListener("click", () => {
    searchToggle.classList.toggle("active");
});

// Sidebar
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

// Live Search
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll(".card").forEach(card => {
            const title = card.querySelector("h3").innerText.toLowerCase();
            card.style.display = title.includes(term) ? "block" : "none";
        });
    });
}

// Modal
document.getElementById("stickerContainer").addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
        modal.classList.add("active");
        modalImg.src = e.target.src;
    }
});

closeBtn.onclick = () => modal.classList.remove("active");

