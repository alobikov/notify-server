const socket = io("http://localhost:3000");
// , {
//   transports: ["websocket"],
// });
const messageContainer = document.getElementById("message-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

console.log("Socket.io", socket.io);

const name = prompt("What is your name");
addMessage("You joined the chat");

socket.emit("new-user", name);

socket.on("connect", () => console.log("socket connected"));

socket.on("chat-message", ({ message, name }) => {
  addMessage(`${name}: ${message}`);
});
socket.on("user-connected", (data) => {
  addMessage(`${data} connects to the chat!`);
});

socket.on("user-disconnected", (name) => {
  addMessage(`${name} disconnects from the chat :(`);
});

socket.on("send-chat-message", (data) => {
  console.log(data);
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  addMessage(`You: ${message}`);
  socket.emit("send-chat-message", message);
  messageInput.value = "";
});

function addMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}
