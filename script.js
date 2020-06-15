// const chalk = require("chalk");
const socket = io("http://localhost:3000", { username: "Aleksej" });

// , {
//   transports: ["websocket"],
// });
const messageContainer = document.getElementById("message-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

console.log("Socket.io", socket.io);

socket.on("connect", () => {
  console.log("socket connected");
  const name = "Dora";
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

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  addMessage(`You: ${message}`);
  // socket.emit("send-message", { body: message });
  let body = {
    msg: "Accept tyres ",
    toUser: "EDA-EMUL",
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
