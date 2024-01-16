import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { v4 as uuid } from "uuid";

const app = express();
const server = http.createServer(app);

type PlayerType = "X" | "O";
type BoardType = (PlayerType | null)[];

interface Player {
  symbol: PlayerType;
  id: string;
}

interface GameState {
  board: BoardType;
  currentPlayer: PlayerType;
  players: Player[];
}

function createEmptyBoard(): BoardType {
  return Array(9).fill(null);
}

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const createPlayer = ({ symbolLeft }: { symbolLeft?: PlayerType } = {}) => {
  return {
    id: uuid(),
    symbol: symbolLeft ? symbolLeft : Math.random() > 0.5 ? "O" : "X",
  } as Player;
};

const createGame = () => {
  return {
    board: createEmptyBoard(),
    currentPlayer: "X" as PlayerType,
    players: [],
  };
};

const getSymbolLeft = (players: Player[]) => {
  let symbolLeft: PlayerType | undefined = undefined;

  if (players.length == 1) {
    symbolLeft = players[0].symbol == "X" ? "O" : "X";
  }

  return symbolLeft;
};

const handleGameReady = (
  gameState: GameState,
  gameId: string,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  gameState.players.forEach((player) => {
    const { id: playerId } = player;
    io.to(playerId).emit("player-ready", { symbol: player.symbol });
  });

  io.to(gameId).emit("game-ready");
  io.to(gameId).emit("game-state", {
    ...gameState,
    players: gameState.players.length,
  });

  io.to(gameState.players[0].id).emit("opponent-joined");

  // check if the game has already ended
  const result =
    checkForWinOrDraw(gameState.board, "X") ||
    checkForWinOrDraw(gameState.board, "O");
  if (result) {
    io.to(gameId).emit("game-end", { result });
  }
};

const games = new Map<string, GameState>();

// events:
// client-ready, client-refused, client-out
io.on("connection", (socket) => {
  let gameId: string;
  let playerId: string;

  socket.on("client-ready", (joinGameId: string) => {
    // set current gameId to game id joined by client
    gameId = joinGameId;
    let gameState = games.get(gameId);

    // create new game if not present
    if (!gameState) {
      gameState = createGame();
      games.set(gameId, gameState);
    }

    // refuse connection if 2 players are already in the game
    if (gameState.players.length === 2) {
      console.log("Server: client-refused");
      return socket.emit("client-refused");
    }

    socket.join(gameId);

    // if there is a player present it returns the symbolLeft, else undefined
    const symbolLeft = getSymbolLeft(gameState.players);

    const newPlayer = createPlayer({ symbolLeft });
    // assign the player
    gameState.players.push(newPlayer);
    playerId = newPlayer.id;

    // join the room with player id
    console.log("Server: ", `client-ready, ${playerId}`);
    socket.join(playerId);

    if (gameState.players.length === 2) {
      handleGameReady(gameState, gameId, io);
    }
  });

  socket.on("make-move", ({ boxId }: { boxId: number }) => {
    const gameState = games.get(gameId);
    if (!gameState || !playerId) return;
    console.log("Server: ", "make-move", playerId);

    if (
      gameState.currentPlayer !=
      gameState.players.find((player) => player.id == playerId)?.symbol
    ) {
      // the current player who requested to move is not on the move
      return io
        .to(playerId)
        .emit("bad-request", "You are not permitted to move right now");
    }

    if (gameState.board[boxId] === null) {
      gameState.board[boxId] = gameState.currentPlayer;

      // handle checking for game end
      const result = checkForWinOrDraw(
        gameState.board,
        gameState.currentPlayer
      );

      if (result) {
        io.to(gameId).emit("game-end", { result });
      }

      gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X";
      io.to(gameId).emit("game-state", {
        ...gameState,
        players: gameState.players.length,
      });
    }
  });

  socket.on("disconnect", () => {
    if (!playerId) return;

    const gameState = games.get(gameId);

    if (!gameState) return;

    const playerIndex = gameState.players.findIndex(
      (player) => player.id === playerId
    );

    if (playerIndex !== -1) {
      gameState.players.splice(playerIndex, 1);
      if (gameState.players.length === 0) {
        games.delete(gameId);
      } else {
        io.to(gameId).emit("opponent-left");
      }
    }
  });
});

// const disconnect = (
//   gameState: GameState,
//   playerId: string,
//   gameId: string,
//   io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
// ) => {

// };

const WINNING_COMBINATIONS = [
  [1, 2, 3],
  [1, 4, 7],
  [1, 5, 9],
  [3, 5, 7],
  [2, 5, 8],
  [3, 6, 9],
  [4, 5, 6],
  [7, 8, 9],
];

const getAllIndexes = (board: BoardType, currentTurn: PlayerType): number[] => {
  var indexes: number[] = [],
    i = -1;
  while ((i = board.indexOf(currentTurn, i + 1)) !== -1) {
    indexes.push(i + 1);
  }
  return indexes;
};

const checkForWinOrDraw = (board: BoardType, currentPlayer: PlayerType) => {
  const currentPositions = getAllIndexes(board, currentPlayer);

  let result: boolean | PlayerType | "Draw" = false;

  for (const winningCombination of WINNING_COMBINATIONS) {
    if (winningCombination.every((num) => currentPositions.includes(num))) {
      result = currentPlayer;
    } else if (board.every((sym) => sym !== null)) {
      result = "Draw";
    }
  }

  return result;
};

server.listen(3001, () => {
  console.log("✔️ Server listening on port 3001");
});
