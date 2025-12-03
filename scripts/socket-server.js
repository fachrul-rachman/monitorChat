/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");

const PORT = Number(process.env.SOCKET_SERVER_PORT || 4000);

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`[socket] client connected ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`[socket] client disconnected ${socket.id}`);
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/events/new-message", (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "Invalid payload" });
  }

  io.emit("new_message", payload);
  res.json({ delivered: true });
});

server.listen(PORT, () => {
  console.log(`[socket] server listening on http://localhost:${PORT}`);
});
