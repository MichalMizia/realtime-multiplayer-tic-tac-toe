const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

import { Server } from "socket.io";

function getRandomFigure(): PlayerType {
  return Math.random() > 0.5 ? "O" : "X";
}

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

interface MoveI {
  squareIndex: number;
  player: "circle" | "cross";
}

type PlayerType = "X" | "O";

io.on("connection", (socket) => {
  // players connected to this socket
  let players: PlayerType[] = [];

  socket.on("client-ready", () => {
    if (players.length === 0) {
      const newPlayer = getRandomFigure();
      players.push(newPlayer);
      socket.emit("client-ready", { newPlayer, gameState: "waiting" });
      console.log(players);
    } else if (players.length === 1) {
      const newPlayer = players.includes("O") ? "X" : "O";
      players.push(newPlayer);
      socket.emit("client-ready", { newPlayer });
      socket.broadcast.emit("client-join", { players });
    } else {
      socket.emit("client-refused");
    }
  });

  socket.on(
    "client-out",
    ({
      currentPlayer,
    }: {
      currentPlayer: { name: string; figure: PlayerType };
    }) => {
      players.filter((player) => player.name !== currentPlayer.name);
    }
  );

  socket.on("make-move", ({ squareIndex, player }: MoveI) => {
    socket.broadcast.emit("make-move", { squareIndex, player });
  });
});

server.listen(3001, () => {
  console.log("✔️ Server listening on port 3001");
});
