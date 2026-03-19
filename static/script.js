document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;

    const modeToggle = document.querySelector(".dark-light");
    const searchToggle = document.querySelector(".searchToggle");
    const searchField = document.querySelector(".search-field");
    const searchInput = document.getElementById("searchInput");

    const nav = document.querySelector("nav");

    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".close");

    const stickerContainer = document.getElementById("stickerContainer");

    const orderPopup = document.getElementById("orderPopup");
    const yesBtn = document.getElementById("yes-btn");
    const laterBtn = document.getElementById("later-btn");

    const uploadInput = document.getElementById("uploadInput");
    const uploadModal = document.getElementById("uploadModal");
    const previewImage = document.getElementById("previewImage");
    const imageNameInput = document.getElementById("imageName");
    const imageCategory = document.getElementById("imageCategory");

    let selectedFile = null;
    let selectedSticker = "";

    function createCardHTML(filePath, name) {
        return `
            <img src="/static/uploads/${filePath}" alt="${name}">
            <h3>${name}</h3>
            <div class="download-row">
                <a href="/static/uploads/${filePath}"
                   download
                   class="download-meta"
                   onclick="showOrderPopup('${filePath}')">
                    <i class="fa-solid fa-download"></i>
                    <span>2.0K</span>
                </a>
            </div>
        `;
    }

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

    if (searchToggle && searchField) {
        searchToggle.addEventListener("click", () => {
            searchToggle.classList.toggle("active");
            searchField.classList.toggle("active");
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();

            document.querySelectorAll(".card").forEach(card => {
                const title = card.querySelector("h3").innerText.toLowerCase();
                card.style.display = title.includes(term) ? "block" : "none";
            });
        });
    }

    if (uploadInput) {
        uploadInput.addEventListener("change", (e) => {
            selectedFile = e.target.files[0];
            if (!selectedFile) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                previewImage.src = event.target.result;
            };
            reader.readAsDataURL(selectedFile);

            imageNameInput.value = selectedFile.name.split(".")[0];
            uploadModal.style.display = "flex";
        });
    }

    window.closeUpload = function () {
        uploadModal.style.display = "none";
        uploadInput.value = "";
        selectedFile = null;
        previewImage.src = "";
        imageNameInput.value = "";
        imageCategory.value = "Anime";
    };

    window.uploadSticker = async function () {
        try {
            if (!selectedFile) {
                alert("Please choose an image first.");
                return;
            }

            const stickerName = imageNameInput.value.trim();
            if (!stickerName) {
                alert("Please enter sticker name.");
                return;
            }

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("name", stickerName);
            formData.append("category", imageCategory.value);

            const res = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            const text = await res.text();

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Server returned non-JSON:", text);
                throw new Error("Server error: " + text.substring(0, 200));
            }

            if (!res.ok || !data.success) {
                throw new Error(data.error || "Upload failed");
            }

            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = createCardHTML(data.filepath, data.name);

            if (stickerContainer) {
                stickerContainer.prepend(card);
            }

            closeUpload();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    if (stickerContainer) {
        stickerContainer.addEventListener("click", (e) => {
            if (e.target.tagName === "IMG") {
                modal.classList.add("active");
                modalImg.src = e.target.src;
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("active");
        });
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

    window.showOrderPopup = function (sticker) {
    selectedSticker = sticker;
    if (orderPopup) {
        orderPopup.style.display = "flex";
        }
    };

    window.closePopup = function () {
        if (orderPopup) {
            orderPopup.style.display = "none";
        }
    };

    window.goToShirt = function () {
    if (selectedSticker) {
        window.location.href = `/tshirt/${encodeURIComponent(selectedSticker)}`;
        }
    };

    if (yesBtn) yesBtn.addEventListener("click", goToShirt);
    if (laterBtn) laterBtn.addEventListener("click", closePopup);

    const categoryButtons = document.querySelectorAll(".category-btn");

    categoryButtons.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();

            const category = btn.dataset.category;

            categoryButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            try {
                const res = await fetch(`/get_stickers?category=${encodeURIComponent(category)}`);
                const data = await res.json();

                stickerContainer.innerHTML = "";

                data.stickers.forEach(sticker => {
                    const stickerName = sticker.split("/").pop().replace(/\.(png|jpg|jpeg|gif)$/i, "");

                    const card = document.createElement("div");
                    card.className = "card";
                    card.innerHTML = createCardHTML(sticker, stickerName);

                    stickerContainer.appendChild(card);
                });

                const pagination = document.getElementById("pagination");
                if (pagination) {
                    pagination.style.display = category === "All" ? "block" : "none";
                }
            } catch (err) {
                console.error(err);
            }
        });
    });
});

function selectSize(button) {
    const sizes = document.querySelectorAll(".sizes button");
    sizes.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
}

function openPayment() {
    const paymentModal = document.getElementById("paymentModal");
    if (paymentModal) paymentModal.style.display = "flex";
}

function closePayment() {
    const paymentModal = document.getElementById("paymentModal");
    if (paymentModal) paymentModal.style.display = "none";
}

function showQR(method) {
    const qr = document.getElementById("qrSection");
    if (!qr) return;

    let img = "";
    let name = "";

    if (method === "kbz") {
        img = "/static/payments/My QR.png";
        name = "KBZPay";
    } else if (method === "aya") {
        img = "/static/payments/My QR.png";
        name = "AYA Pay";
    } else if (method === "city") {
        img = "/static/payments/My QR.png";
        name = "City Pay";
    }

    qr.innerHTML = `
        <div class="qr-box">
            <h3>Pay with ${name}</h3>
            <img src="${img}" class="qr-image" alt="${name} QR">
            <p class="qr-instruction">
                1. Open your ${name} app<br>
                2. Tap Scan QR<br>
                3. Scan this code<br>
                4. Complete payment
            </p>
            <p class="payment-note">
                After payment send screenshot to our email
            </p>
        </div>
    `;
}