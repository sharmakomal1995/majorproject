
function openGallery() {
    document.getElementById("photoModal").style.display = "block";
    document.body.classList.add("modal-open");
}

function closeGallery() {
    document.getElementById("photoModal").style.display = "none";
    document.body.classList.remove("modal-open");
}



const btn = document.getElementById("toggleBtn");
const box = document.getElementById("moreDetails");
if (btn && box) {
    btn.addEventListener("click", () => {
        if (box.style.display === "none" || box.style.display === "") {
            box.style.display = "block";
            btn.textContent = "Show less";
        } else {
            box.style.display = "none";
            btn.textContent = "Show more";
        }
    });
}


function openAboutPopup() {
    document.getElementById("aboutPopup").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeAboutPopup() {
    document.getElementById("aboutPopup").classList.remove("active");
    document.body.style.overflow = "auto";
}



function toggleAmenities() {
    const section = document.getElementById("amenitiesSection");
    if (section.style.display === "none") {
        section.style.display = "block";
    } else {
        section.style.display = "none";
    }
}



function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
}



const saveBtn = document.getElementById("saveBtn");

if (saveBtn) {
    saveBtn.addEventListener("click", async function () {

        const id = this.dataset.id;
        const icon = this.querySelector("i");

        const res = await fetch(`/wishlist/${id}`, { method: "POST" });
        const data = await res.json();

        if (data.saved) {
            icon.classList.replace("fa-regular", "fa-solid");
            icon.classList.add("text-danger");
        } else {
            icon.classList.replace("fa-solid", "fa-regular");
            icon.classList.remove("text-danger");
        }

    });
}



document.querySelectorAll('.bar-fill').forEach(bar => {
    const width = bar.dataset.width;
    bar.style.width = width + '%';
});



function openCommentPopup(id) {
    document.getElementById("popup-" + id).style.display = "flex";
}

function closeCommentPopup(id) {
    document.getElementById("popup-" + id).style.display = "none";
}



document.querySelectorAll(".review-stars").forEach(group => {

    const stars = group.querySelectorAll(".review-star");
    const input = group.querySelector("input");

    stars.forEach(star => {

        star.addEventListener("mouseenter", () => {
            let val = star.dataset.value;
            highlight(val);
        });

        star.addEventListener("click", () => {
            let val = star.dataset.value;
            input.value = val;
            highlight(val);
        });

    });

    group.addEventListener("mouseleave", () => {
        highlight(input.value);
    });

    function highlight(val) {
        stars.forEach(s => {
            s.classList.toggle("active", s.dataset.value <= val);
        });
    }

});



document.addEventListener("DOMContentLoaded", function () {

    const heading = document.getElementById("bookingHeading");
    const pricePerNight = parseInt(heading.dataset.price) || 0;

    let guests = {
        adults: 1,
        children: 0,
        infants: 0,
        pets: 0
    };

    const dropdown = document.getElementById("bookingGuestDropdown");
    const wrapper = document.querySelector(".booking-guest-wrapper");
    const summaryEl = document.getElementById("bookingGuestSummary");
    const hiddenAdults = document.getElementById("hiddenAdults");
    const hiddenChildren = document.getElementById("hiddenChildren");
    const hiddenInfants = document.getElementById("hiddenInfants");
    const hiddenPets = document.getElementById("hiddenPets");


    /* =====================
       TOGGLE DROPDOWN
    ===================== */
    document.querySelector(".booking-guest-display")
        .addEventListener("click", function (e) {
            e.stopPropagation();
            dropdown.style.display =
                dropdown.style.display === "block" ? "none" : "block";
        });

    /* =====================
       CHANGE GUEST
    ===================== */
    document.querySelectorAll(".booking-counter button")
        .forEach(button => {
            button.addEventListener("click", function () {

                const type = this.closest(".booking-guest-row")
                    .querySelector("strong")
                    .innerText.toLowerCase();

                const isPlus = this.innerText === "+";
                const value = isPlus ? 1 : -1;

                guests[type] += value;

                if (type === "adults" && guests.adults < 1) {
                    guests.adults = 1;
                }

                if (guests[type] < 0) {
                    guests[type] = 0;
                }
                console.log("Clicked", type);

                updateGuestUI();
            });
        });

    function updateGuestUI() {

        document.querySelector(".adultsCount").innerText = guests.adults;
        document.querySelector(".childrenCount").innerText = guests.children;
        document.querySelector(".infantsCount").innerText = guests.infants;
        document.querySelector(".petsCount").innerText = guests.pets;

        let summaryParts = [];

        if (guests.adults > 0) {
            summaryParts.push(
                guests.adults + (guests.adults > 1 ? " adults" : " adult")
            );
        }

        if (guests.children > 0) {
            summaryParts.push(
                guests.children + (guests.children > 1 ? " children" : " child")
            );
        }

        if (guests.infants > 0) {
            summaryParts.push(
                guests.infants + (guests.infants > 1 ? " infants" : " infant")
            );
        }

        if (guests.pets > 0) {
            summaryParts.push(
                guests.pets + (guests.pets > 1 ? " pets" : " pet")
            );
        }

        summaryEl.innerText = summaryParts.join(", ");

        // hidden inputs update
        hiddenAdults.value = guests.adults;
        hiddenChildren.value = guests.children;
        hiddenInfants.value = guests.infants;
        hiddenPets.value = guests.pets;
    }


    /* =====================
        PRICE LOGIC
        ===================== */
    const checkInInput = document.querySelector("input[name='checkIn']");
    const checkOutInput = document.querySelector("input[name='checkOut']");
    const button = document.getElementById("availabilityBtn");
    
    /* =====================
        DISABLE PAST DATES
       ===================== */

    // Aaj ki date
    const today = new Date().toISOString().split("T")[0];

    // Past dates disable
    checkInInput.setAttribute("min", today);
    checkOutInput.setAttribute("min", today);

    // Checkout always after checkin
    checkInInput.addEventListener("change", function () {

        checkOutInput.setAttribute("min", this.value);

        // Agar checkout already smaller hai to reset karo
        if (checkOutInput.value < this.value) {
            checkOutInput.value = "";
        }

        calculateNights(); 
    });


    function calculateNights() {

        if (!checkInInput.value || !checkOutInput.value) {
            resetUI();
            return;
        }

        const nights =
            (new Date(checkOutInput.value) -
                new Date(checkInInput.value)) /
            (1000 * 60 * 60 * 24);

        if (nights > 0) {
            const total = nights * pricePerNight;

            heading.innerText =
                `₹${total.toLocaleString()} for ${nights} night${nights > 1 ? "s" : ""}`;

            button.innerText = "Reserve";
            button.style.backgroundColor = "#ff385c";
        } else {
            resetUI();
        }
    }

    function resetUI() {
        heading.innerText = "Add dates for prices";
        button.innerText = "Check availability";
        button.style.backgroundColor = "";
    }
    checkOutInput.addEventListener("change", calculateNights);

    /* =====================
       CLOSE DROPDOWN
    ===================== */
    window.addEventListener("click", function (e) {
        if (!wrapper.contains(e.target)) {
            dropdown.style.display = "none";
        }
    });

    updateGuestUI();
});



document.addEventListener("DOMContentLoaded", function () {

    const mainNavbar = document.getElementById("mainNavbar");
    const sectionNavbar = document.getElementById("sectionNavbar");
    const photos = document.getElementById("photosSection");

    window.addEventListener("scroll", function () {

        const photosBottom = photos.getBoundingClientRect().bottom;

        if (photosBottom <= 100) {
            mainNavbar.style.transform = "translateY(-100%)";
            sectionNavbar.style.display = "flex";
        } else {
            mainNavbar.style.transform = "translateY(0)";
            sectionNavbar.style.display = "none";
        }

    });

});




function toggleAmenities() {

    const amenities = document.querySelectorAll("#amenitiesList .amenity-item");
    const btn = document.querySelector(".show-amenities-btn");

    amenities.forEach((item, index) => {
        if (index >= 5) {
            item.classList.toggle("hidden-amenity");
        }
    });

    btn.innerText =
        btn.innerText === "Show all amenities"
            ? "Show less"
            : "Show all amenities";

}

document.addEventListener("DOMContentLoaded", () => {

    if (window.innerWidth <= 768) {

        const amenities = document.querySelectorAll("#amenitiesList .amenity-item");

        amenities.forEach((item, index) => {
            if (index >= 5) {
                item.classList.add("hidden-amenity");
            }
        });

    } else {

        document.querySelector(".show-amenities-btn").style.display = "none";

    }

});




document.addEventListener("DOMContentLoaded", function () {

    const btn = document.getElementById("showAllReviewsBtn");
    const reviews = document.querySelectorAll(".review-card");

    if (btn) {
        btn.addEventListener("click", function () {

            reviews.forEach(card => {
                card.style.display = "block";
            });

            btn.style.display = "none";

        });
    }

});
