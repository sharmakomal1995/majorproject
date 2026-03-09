console.log("feedback.js loaded");

window.openFeedbackModal = function (e) {
  e.preventDefault();
  document.getElementById("feedbackModal").style.display = "flex";
};

window.closeFeedbackModal = function () {
  document.getElementById("feedbackModal").style.display = "none";
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");
  const textarea = document.getElementById("feedbackText");
  const submitBtn = document.querySelector(".feedback-submit");

  if (!form || !textarea || !submitBtn) return;

  textarea.addEventListener("input", () => {
    submitBtn.disabled = textarea.value.trim().length === 0;
  });

  form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const feedback = textarea.value.trim();
    const isBug = document.getElementById("isBug")?.checked || false;
    const page = window.location.pathname;

    const res = await fetch("/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feedback,
        isBug,
        page,
      }),
    });

    if (!res.ok) throw new Error("Request failed");

    alert("Thanks for your feedback ");
    form.reset();
    submitBtn.disabled = true;
    closeFeedbackModal();

  } catch (err) {
    console.error(err);
    alert("Something went wrong ");
  }
});

});
