// const chalk = require("chalk");
const socket = io("http://localhost:3000", { username: "Aleksej" });

// , {
//   transports: ["websocket"],
// });
const selectContainer = document.getElementById("select-container");
const messageForm = document.getElementById("send-button");
const messageInput = document.getElementById("message-input");

console.log("Socket.io", socket.io);

socket.on("connect", () => {
  console.log("socket connected");
  const name = "Web-Dev";
  socket.emit("new-user", name);
});

socket.on("message", ({ message, from }) => {
  console.log({ message });
  addMessage(`${from}: ${message}`);
});
socket.on("user-connected", (data) => {
  addMessage(`${data} connects to the chat!`);
});

socket.on("user-disconnected", (name) => {
  addMessage(`${name} disconnects from the chat :(`);
});

socket.on("send-message", (data) => {
  console.log(data);
});

messageForm.addEventListener("click", (e) => {
  console.log("send button clicked");
  e.preventDefault();
  const message = messageInput.value;
  // socket.emit("send-message", { body: message });
  let body = {
    message: message,
    to: "EDA-EMUL",
    from: "Web-Dev",
  };
  fetch("http://127.0.0.1:3002/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(body),
  }).then((res) => {
    res.json().then((json) => console.log(json));
  });

  messageInput.value = "";
});

function addMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}

function createDropDown() {
  const optionElement = document.createElement("option");
  optionElement.value = addressee;
  selectContainer.append(optionElement);
}
