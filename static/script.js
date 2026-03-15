document.addEventListener("DOMContentLoaded", () => {

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

    const orderPopup = document.getElementById("orderPopup");
    const yesBtn = document.getElementById("yes-btn");
    const laterBtn = document.getElementById("later-btn");

    let selectedSticker = "";

    // =======================
    // DARK MODE
    // =======================
    if (localStorage.getItem("mode") === "dark-mode") {
        body.classList.add("dark");
        if (modeToggle) modeToggle.classList.add("active");
    }

    if (modeToggle) {
        modeToggle.addEventListener("click", () => {

            body.classList.toggle("dark");
            modeToggle.classList.toggle("active");

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
    if (searchToggle && searchField) {
        searchToggle.addEventListener("click", () => {
            searchToggle.classList.toggle("active");
            searchField.classList.toggle("active");
        });
    }

    // =======================
    // SIDEBAR
    // =======================
    if (sidebarOpen && nav) {
        sidebarOpen.addEventListener("click", () => nav.classList.add("active"));
    }

    if (sidebarClose && nav) {
        sidebarClose.addEventListener("click", () => nav.classList.remove("active"));
    }

    // =======================
    // LIVE SEARCH
    // =======================
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {

            const term = e.target.value.toLowerCase();

            document.querySelectorAll(".card").forEach(card => {

                const title = card.querySelector("h3").innerText.toLowerCase();

                if (title.includes(term)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }

            });

        });
    }

    // =======================
    // MODAL
    // =======================
    if (stickerContainer && modal && modalImg) {

        stickerContainer.addEventListener("click", (e) => {

            if (e.target.tagName === "IMG") {

                modal.classList.add("active");
                modalImg.src = e.target.src;

            }

        });

    }

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    }

    if (modal) {
        modal.addEventListener("click", (e) => {

            if (e.target === modal) {
                modal.classList.remove("active");
            }

        });
    }

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape" && modal) {
            modal.classList.remove("active");
        }

    });

    // =======================
    // TSHIRT POPUP
    // =======================
    window.showOrderPopup = function(sticker){

        selectedSticker = encodeURIComponent(sticker);

        if(orderPopup){
            orderPopup.style.display = "flex";
        }

    }

    window.closePopup = function(){

        if(orderPopup){
            orderPopup.style.display = "none";
        }

    }

    window.goToShirt = function(){

        if(selectedSticker !== ""){
            window.location.href = `/tshirt/${selectedSticker}`;
        }

    }

    if(yesBtn){
        yesBtn.addEventListener("click", goToShirt);
    }

    if(laterBtn){
        laterBtn.addEventListener("click", closePopup);
    }

    // =======================
    // CATEGORY FILTER
    // =======================
    const categoryButtons = document.querySelectorAll(".category-btn");

    categoryButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            // Get category from data attribute or button text
            const category = btn.dataset.category || btn.textContent;

            // Remove 'active' class from all buttons and add to clicked
            categoryButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Fetch stickers for this category
            fetch(`/get_stickers?category=${category}`)
                .then(res => res.json())
                .then(data => {
                    stickerContainer.innerHTML = "";

                    data.stickers.forEach(sticker => {
                        const card = document.createElement("div");
                        card.className = "card";

                        card.innerHTML = `
                            <img src="/static/uploads/${sticker}"> 
                            <h3>${sticker.split('/')[1]}</h3>
                            <div class="button-group">
                                <a href="/static/uploads/${category}/${sticker}" download class="btn download" onclick="showOrderPopup('${sticker}')">
                                    <i class="fa-solid fa-download"></i>
                                    <span>Download</span>
                                </a>
                            </div>
                        `;
                        stickerContainer.appendChild(card);
                    });
                });
        });
    });

    // Load "All" stickers initially
    loadStickers("All");

});

// =======================
// SIZE SELECTOR
// =======================
function selectSize(button){

    const sizes = document.querySelectorAll(".sizes button");

    sizes.forEach(btn=>{
        btn.classList.remove("active");
    });

    button.classList.add("active");

}

// OPEN CHECKOUT
function openPayment(){
    document.getElementById("paymentModal").style.display = "flex";
}

// CLOSE
function closePayment(){
    document.getElementById("paymentModal").style.display = "none";
}

// SHOW QR PAYMENT
function showQR(method){

    const qr = document.getElementById("qrSection");

    let img = "";
    let name = "";

    if(method === "kbz"){
        img = "/static/payments/My QR.png";
        name = "KBZPay";
    }

    if(method === "aya"){
        img = "/static/payments/My QR.png";
        name = "AYA Pay";
    }

    if(method === "city"){
        img = "/static/payments/My QR.png";
        name = "City Pay";
    }

    qr.innerHTML = `
    
    <div class="qr-box">

        <h3>Pay with ${name}</h3>

        <img src="${img}" class="qr-image">

        <p class="qr-instruction">
        1. Open your ${name} app<br>
        2. Tap "Scan QR"<br>
        3. Scan this code<br>
        4. Complete the payment
        </p>

        <p class="payment-note">
        After payment please send screenshot to our email.
        </p>

    </div>

    `;
}