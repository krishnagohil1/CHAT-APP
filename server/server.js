const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Assign a unique username to the user
  const username = `User${socket.id.slice(0, 4)}`;
  socket.emit("username", username); // Send the username to the client

  // Listen for incoming messages
  socket.on("sendMessage", (data) => {
    // Broadcast the message to all clients
    io.emit("receiveMessage", { text: data.message, sender: data.sender });
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});