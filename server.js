/*
Что должен уметь сервер?
У сервера два API. 
Первый - websockets, для работы с мобильными клиентами.
  Платформа Socket.io;
  Авторизация клиента по шаблону имени и возможно по сетке.
    Используемые методы:
      connection
      disconnect
      send-message (custom) входящий, сообщение от мобильного клиета
      message (custom) исходящий, сообщение для мобильного клиента
      new-user (custom) входящий, регистрация нового клиента 
Второй интерфейс - для связи с CRM Dynamics.
  Платформа Express.js;
  Авторизация клиента по IP адресу.
  Методы: 
    GET - запросить список адресатов.
    POST - послать сообщение.
*/

const mongo = require("mongodb");
const createMock = require("./utils/createMock");
const getAllMessages = require("./utils/mongo");
const Message = require("./models/Message");
const mongoose = require("mongoose");
const chalk = require("chalk");
const express = require("express");
const app = express();
const expressPort = 3002;
const wsPort = 3000;
const mongodbUrl = "mongodb://127.0.0.1:27017/notify";

// this is storage for socketio subscribed user
// it is being hold only in RAM as user dynamiclly
// reconnects to socketio;
// holds {socket.id : user} pairs
var users = {};

async function start() {
  try {
    await mongoose.connect(mongodbUrl, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log("Mongo db connected on", mongodbUrl);
    // createMock();
    runExpress();
  } catch (e) {
    console.log(chalk.red("Mongo db connection error", e));
  }
}

function runExpress() {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });

  app.use(express.json());

  //**************************** API GET ROOT/WELCOME **************************/
  // This is welcome message of API
  app.get("/", function (req, res) {
    console.log('GET on "/" recieved');
    res.send(`<h2>API for CRM</h2>`);
  });
  //**************************** API GET MESSAGES ******************************/
  app.get("/messages", async function (req, res) {
    console.log('GET on "/messages" recieved');
    res.json(await getAllMessages());
  });
  //**************************** API GET USERS *********************************/
  app.get("/users", function (req, res) {
    console.log('GET on "/users" received');
    const usersJson = Object.keys(users).map((key) => {
      return { socketId: key, deviceId: users[key] };
    });
    res.json(usersJson);
  });
  //**************************** API GET USERS AND ID **************************/
  app.get("/users_id", function (req, res) {
    console.log('GET on "/users_id" received');
    // alternative way to send json from express
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ users }));
  });
  //**************************** API POST MESSAGE ******************************/
  // This service used by CRM and webclient to send target message to
  // mobile terminal
  app.post("/message", (req, res) => {
    console.log('POST to "/messages" received');
    res.send({ response: "Message received" });

    const { message, to, from } = req.body;
    const timestamp = Date.now();

    console.log(
      message.trim() +
        " | sent to " +
        to +
        " | on " +
        Date(timestamp).toString().slice(0, 24)
    );
    // save message in mongo
    const msgToDb = new Message({
      message: message,
      to: to,
      confirmed: false,
      from: from && "CRM",
      timestamp: Date.now(),
    });
    msgToDb.save();

    // check presence of addressee in users
    // emit message if addresse exists
    const targetSocket = Object.keys(users).filter((key) => {
      console.log(users[key]);
      return users[key] === to;
    })[0];
    console.log({ targetSocket });
    if (targetSocket) {
      console.log("emitting personally");
      io.to(targetSocket).emit("message", {
        message: msg,
        timestamp: timestamp,
        to: to,
        from: "CRM",
      });
    }
  });

  app.listen(expressPort, () =>
    console.log(chalk.yellow("Expess listening on port ", expressPort))
  );
}

const io = require("socket.io")(wsPort);
//      , {
//   transports: ["websocket"],
// });

//****************************************************************************/
// Main event loop of Socket.io
// receives custome method 'send-message' from user and relay emits
// 'message' to users
// This is supplementary service which allows mobile users to send messages
io.on("connection", (socket) => {
  console.log("new user", socket.id, new Date());
  socket.on("send-message", (data) => {
    console.log(data);
    socket.broadcast.emit("message", {
      message: data.message,
      from: data.from,
      to: data.to,
    });
  });

  socket.on("new-user", (name) => {
    users[socket.id] = name; // save value pair in users
    console.log(chalk.red("New user registred %s"), users);
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id];
  });
});

start();
