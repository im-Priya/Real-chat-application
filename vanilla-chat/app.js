import { addMessage, subscribeMessages } from "./firebase.js";

const messagesEl = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const nameDialog = document.getElementById("nameDialog");
const nameInput = document.getElementById("nameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const changeNameBtn = document.getElementById("changeNameBtn");
const usernameDisplay = document.getElementById("usernameDisplay");

const USERNAME_KEY = "chat_username";

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ?? "?")
    .slice(0, 2)
    .join("");
}

function sanitize(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function ensureUsername() {
  let stored = localStorage.getItem(USERNAME_KEY);
  if (!stored) {
    nameDialog.showModal();
  } else {
    usernameDisplay.textContent = stored;
  }
}

saveNameBtn.addEventListener("click", (e) => {
  const value = nameInput.value.trim();
  if (!value) return;
  localStorage.setItem(USERNAME_KEY, value);
  usernameDisplay.textContent = value;
});

changeNameBtn.addEventListener("click", () => {
  nameInput.value = localStorage.getItem(USERNAME_KEY) || "";
  nameDialog.showModal();
});

messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  const author = localStorage.getItem(USERNAME_KEY) || "Anonymous";
  messageInput.value = "";
  messageInput.focus();
  try {
    await addMessage({ author, text });
  } catch (err) {
    alert("Failed to send message. Check Firebase config.");
    console.error(err);
  }
});

function renderMessage(doc, currentUser) {
  const data = doc.data();
  const li = document.createElement("li");
  const isMe = data.author === currentUser;
  li.className = `msg ${isMe ? "msg--me" : ""}`;
  
  const time = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
  
  li.innerHTML = `
    <div class="msg__avatar">${getInitials(data.author || "?")}</div>
    <div class="msg__bubble">
      ${!isMe ? `<div class="msg__meta"><span class="msg__author">${sanitize(data.author || "?")}</span></div>` : ''}
      <div class="msg__text">${sanitize(data.text || "")}</div>
      <div class="msg__time">${time}</div>
    </div>
  `;
  return li;
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function subscribe() {
  let currentUser = localStorage.getItem(USERNAME_KEY) || "";
  return subscribeMessages((snapshot) => {
    currentUser = localStorage.getItem(USERNAME_KEY) || "";
    messagesEl.innerHTML = "";
    snapshot.forEach((doc) => {
      messagesEl.appendChild(renderMessage(doc, currentUser));
    });
    scrollToBottom();
  });
}

ensureUsername();
let unsubscribe = subscribe();

window.addEventListener("storage", (e) => {
  if (e.key === USERNAME_KEY) {
    if (unsubscribe) unsubscribe();
    unsubscribe = subscribe();
  }
});



