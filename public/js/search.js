const whereBox = document.getElementById("whereBox");
const whereInput = document.getElementById("whereInput");
const whereDropdown = document.getElementById("whereDropdown");

whereBox.addEventListener("click", () => {
  whereDropdown.style.display = "block";
  whereInput.focus();
});

document.querySelectorAll(".where-option").forEach(option => {
  option.addEventListener("click", () => {
    whereInput.value = option.innerText;
    whereDropdown.style.display = "none";
  });
});

document.addEventListener("click", (e) => {
  if (!whereBox.contains(e.target)) {
    whereDropdown.style.display = "none";
  }
});

/* WHEN LOGIC */
const whenBox = document.getElementById("whenBox");
const whenInput = document.getElementById("whenInput");
const whenDropdown = document.getElementById("whenDropdown");
const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");

whenBox.addEventListener("click", () => {
  whenDropdown.style.display = "block";
});

function updateDates() {
  if (checkIn.value && checkOut.value) {
    const inDate = new Date(checkIn.value).toDateString();
    const outDate = new Date(checkOut.value).toDateString();
    whenInput.value = `${inDate} - ${outDate}`;
    whenDropdown.style.display = "none";
  }
}
checkIn.addEventListener("change", updateDates);
checkOut.addEventListener("change", updateDates);

document.addEventListener("click", (e) => {
  if (!whenBox.contains(e.target)) {
    whenDropdown.style.display = "none";
  }
});

/* WHO LOGIC */
const whoBox = document.getElementById("whoBox");
const whoInput = document.getElementById("whoInput");
const whoDropdown = document.getElementById("whoDropdown");

let guests = {
  adults: 0,
  children: 0,
  infants: 0,
  pets: 0
};

function updateGuestText() {
  const total = guests.adults + guests.children + guests.infants +
    guests.pets;
  whoInput.value = total === 1 ? "1 guest" : `${total} guests`;
  const maxGuestsInput = document.getElementById("maxGuestsInput");
  if (maxGuestsInput) {
     maxGuestsInput.value = total < 1 ? 1 : total;
  }
}
whoBox.addEventListener("click", (e) => {
  e.stopPropagation();
  whoDropdown.style.display = "block";
});
document.querySelectorAll(".plus,.minus").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const type = btn.dataset.type;
    if (btn.classList.contains("plus")) {
      guests[type]++;
    } else {
      if (guests[type] > 0) {
        guests[type]--;
      }
    }
    document.getElementById(type + "Count").innerText = guests[type];
    updateGuestText();
  });
});
document.addEventListener("click", (e) => {
  if (!whoBox.contains(e.target)) {
    whoDropdown.style.display = "none";
  }
});