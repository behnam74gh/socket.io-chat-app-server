const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");

const {
  addUser,
  removeUser,
  getCurrentUser,
  getUsersInCurrentRoom,
} = require("./util/socketIoUsers");
const { formatMessage } = require("./util/socketIoMessage");
const router = require("./router");

const app = express();
const httpServer = http.createServer(app);
const io = socketio(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

//middlewares
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

//runs when client connects
io.on("connection", (socket) => {
  let bot = "مدیر :";

  //when user join into partecular room
  socket.on("join", ({ name, room }, callback) => {
    const { user, errorMessage } = addUser({ id: socket.id, name, room });

    if (errorMessage && errorMessage.length > 0) {
      callback({ errorMessage });
    }

    socket.join(user.room);

    //just for current user who entered into chat-group
    socket.emit(
      "message",
      formatMessage({
        user: bot,
        message: `${user.name} به گپ ${user.room} خوش آمدید!`,
      })
    );

    //for old-users in chat-group
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage({ user: bot, message: `${user.name} وارد گپ شد!` })
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInCurrentRoom(user.room),
    });

    callback({ errorMessage: "" });
  });

  //runs when a message sent from client
  socket.on("sendMessage", (message, callback) => {
    const user = getCurrentUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage({ user: user.name, message })
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInCurrentRoom(user.room),
      });

      callback({ errorMessage: "" });
    }

    callback({ errorMessage: "خطایی رخ داده است" });
  });

  //runs when client leave
  socket.on("leave", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage({ user: bot, message: `${user.name} ، از گپ خارج شد!` })
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInCurrentRoom(user.room),
      });
    }
  });

  //runs when client disconnects
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage({ user: bot, message: `${user.name} ، از گپ خارج شد!` })
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInCurrentRoom(user.room),
      });
    }
  });
});

app.use(router);

const port = process.env.PORT || 5000;

httpServer.listen(port, () =>
  console.log(`server is ready in port => ${port}`)
);
