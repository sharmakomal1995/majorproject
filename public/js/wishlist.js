async function toggleHeart(event, el) {
    event.preventDefault();   

    const listingId = el.dataset.id;
    const icon = el.querySelector("i");

    try {
        const res = await fetch(`/wishlist/${listingId}`, {
            method: "POST",
             headers: {
        "Content-Type": "application/json"
    }
        });

        const data = await res.json();

        if (data.success) {
            el.classList.toggle("active");
            icon.classList.toggle("fa-solid");
            icon.classList.toggle("fa-regular");
        }

    } catch (err) {
        console.error(err);
    }
}