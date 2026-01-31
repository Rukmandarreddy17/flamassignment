const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const stateManager = require("./state-manager");

const app = express();
const server = http.createServer(app);
const io = new Server(server);


const clientPath = path.join(__dirname, "..", "client");

app.use(express.static(clientPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const roomId = "main-room";

  socket.join(roomId);

  // Send history
  socket.emit(
    "load_history",
    stateManager.get(roomId)
  );

  // DRAW
  socket.on("drawing", (data) => {
    data.userId = socket.id;

    stateManager.add(roomId, data);

    console.log("Stroke added by:", socket.id);

    socket.to(roomId).emit("drawing", data);
  });

  // UNDO
  socket.on("undo", () => {
    console.log("Undo requested by:", socket.id);

    stateManager.undo(roomId, socket.id);

    const history = stateManager.get(roomId);

    console.log("History length:", history.length);

    io.to(roomId).emit(
      "load_history",
      history
    );
  });

  // CURSOR
  socket.on("cursor", (data) => {
    socket.to(roomId).emit("cursor", {
      id: socket.id,
      ...data,
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    socket.to(roomId).emit(
      "user_left",
      socket.id
    );
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
