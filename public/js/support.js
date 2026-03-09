const form = document.getElementById("supportForm");
const input = document.getElementById("supportInput");
const chatBox = document.getElementById("chatBox");

async function loadChat() {
  const res = await fetch("/support");
  const msgs = await res.json();

   chatBox.innerHTML = "";

  if (msgs.length === 0) {
    addMessage("Hi! Describe your issue and our team will help you.", "support");
  }

  msgs.forEach(m => {
    addMessage(m.message, "user");
    if (m.reply) addMessage(m.reply, "support");
  });
}

loadChat();
setInterval(loadChat, 2000);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  await fetch("/support", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });

  addMessage(text, "user");
  input.value = "";
});

function addMessage(msg, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerText = msg;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
