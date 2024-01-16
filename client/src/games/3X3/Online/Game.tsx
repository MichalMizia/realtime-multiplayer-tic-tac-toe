import { useState, useEffect, memo, useRef } from "react";
import Board from "../Board";
import TitleBox from "@/components/TitleBox";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";

const socket = io("http://localhost:3001");

interface OnlineGameProps {}

type PlayerType = "X" | "O";
type BoardType = (PlayerType | null)[];

interface GameState {
  board: BoardType;
  currentPlayer: PlayerType;
  players: number;
}

export type ResultType = "Playing" | "Draw" | "Win" | "Lose";

export interface GameResultType {
  result: "Draw" | PlayerType;
}

const OnlineGame = ({}: OnlineGameProps) => {
  const { gameId: id } = useParams();

  const [board, setBoard] = useState<BoardType>(Array(9).fill(null));
  const playerSymbol = useRef<PlayerType | null>(null);
  const [subtitle, setSubtitle] = useState<string>("");
  const [isWaiting, setIsWaiting] = useState<boolean>(true);
  const [canMove, setCanMove] = useState<boolean>(true);
  const [result, setResult] = useState<ResultType>("Playing");
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("client-ready", id);

    socket.on("client-refused", () => {
      toast.error("Can't join, there are already 2 players on this board");
      navigate("/");
    });

    socket.on("player-ready", ({ symbol }: { symbol: PlayerType }) => {
      console.log("Player Ready", symbol);

      playerSymbol.current = symbol;
      setCanMove(symbol == "X");
    });

    socket.on("game-ready", () => {
      console.log("Game ready: ");
      setIsWaiting(false);
      setSubtitle("Your symbol: " + playerSymbol.current);
    });

    socket.on("opponent-joined", () => {
      toast.success("The opponent has joined.");
    });

    socket.on("game-state", (gameState: GameState) => {
      console.log("Game state: ", gameState);
      setBoard(gameState.board);
      setCanMove(gameState.currentPlayer == playerSymbol.current);
    });

    socket.on("game-end", (data: GameResultType) => {
      const { result } = data;
      if (result == "Draw") {
        setResult("Draw");
      } else {
        console.log("Result: ", result);
        if (result == playerSymbol.current) {
          setResult("Win");
        } else {
          setResult("Lose");
        }
        setSubtitle((prev) => prev + ". The game has ended");
      }
    });

    socket.on("bad-request", (message) => {
      return toast.error(message);
    });

    socket.on("opponent-left", () => {
      toast("Your opponent has left the game.");
      setIsWaiting(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleBoxClick = (boxId: number): void => {
    if (result !== "Playing") return;
    if (!canMove) return;

    socket.emit("make-move", { boxId });
  };

  const GAME_END_MESSAGES = {
    Draw: "Draw.",
    Win: "You won!",
    Lose: "You lost.",
  };

  return (
    <div
      id="3x3"
      className="flex m-auto flex-col lg:w-full relative lg:flex-row lg:items-start"
    >
      <div className="flex-1 sticky top-0 lg:justify-end">
        <TitleBox
          message={
            isWaiting
              ? "Waiting."
              : result !== "Playing"
              ? GAME_END_MESSAGES[result]
              : `${canMove ? "Your turn." : "Waiting for your opponent."}`
          }
          subtitle={
            isWaiting ? (
              <span className="flex items-center justify-start gap-2">
                Waiting for the second player to join{" "}
                <BarLoader speedMultiplier={0.5} />
              </span>
            ) : (
              subtitle
            )
          }
        />
      </div>
      <div className="flex-[2] lg:justify-start">
        <Board
          turn={
            playerSymbol.current && canMove ? playerSymbol.current : undefined
          }
          onClick={handleBoxClick}
          board={board}
        />
      </div>
    </div>
  );
};

export default memo(OnlineGame);
