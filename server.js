const io = require("socket.io")(3000);
//     , {
//   transports: ["websocket"],
// });

const users = {};

io.on("connection", (socket) => {
  console.log("new user");
  socket.emit("chat-message", "Hello chatters!");
  socket.on("send-chat-message", (data) => {
    console.log(data);
    socket.broadcast.emit("chat-message", {
      message: data,
      name: users[socket.id],
    });
  });
  socket.on("new-user", (data) => {
    users[socket.id] = data; // save value pair in users
    socket.broadcast.emit("user-connected", data);
    console.log({ users });
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id];
  });
});
