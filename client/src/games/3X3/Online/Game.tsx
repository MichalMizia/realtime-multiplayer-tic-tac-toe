import { useState, useEffect, memo } from "react";
import Board from "../Board";
import TitleBox from "@/components/TitleBox";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const socket = io("http://localhost:3001");

interface OnlineGameProps {}

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

export type PlayerType = "O" | "X";

export type BoardType = ("O" | "X" | null)[];

export type ResultType = "Playing" | "Draw" | "Win";

const OnlineGame = ({}: OnlineGameProps) => {
  const { gameId: id } = useParams();
  console.log(id);

  const [board, setBoard] = useState<BoardType>(Array(9).fill(null));
  const [subtitle, setSubtitle] = useState<string>("");
  const [canMove, setCanMove] = useState<boolean>(true);
  const [currentPlayer, setCurrentPlayer] = useState<{
    name: string;
    figure: PlayerType;
  }>({ name: "", figure: "X" });
  const [result, setResult] = useState<ResultType>("Playing");
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("client-ready");

    socket.on("client-refused", () => {
      toast.error("Can't join, there are already 2 players on this board");
      navigate("/");
    });

    socket.on(
      "client-ready",
      ({ newPlayer }: { newPlayer: { name: string; figure: PlayerType } }) => {
        console.log("Client Ready");
        console.log("1 player");
        console.log(newPlayer);
        setCurrentPlayer(newPlayer);
        setSubtitle("Waiting for the second player to join");
      }
    );

    return () => {
      socket.emit("client-out", { currentPlayer });
    };
  }, []);

  const getAllIndexes = (
    board: BoardType,
    currentTurn: PlayerType
  ): number[] => {
    var indexes: number[] = [],
      i = -1;
    while ((i = board.indexOf(currentTurn, i + 1)) !== -1) {
      indexes.push(i + 1);
    }
    return indexes;
  };

  const checkForWinOrDraw = (board: BoardType): boolean => {
    const currentPositions = getAllIndexes(board, currentPlayer.figure);

    let hasEnded = false;
    WINNING_COMBINATIONS.forEach((winningCombination) => {
      if (winningCombination.every((num) => currentPositions.includes(num))) {
        setResult("Win");
        hasEnded = true;
      } else if (board.every((sym) => sym !== null) && result === "Playing") {
        setResult("Draw");
        hasEnded = true;
      }
    });

    return hasEnded;
  };

  const handleBoxClick = (boxId: number): void => {
    if (result !== "Playing") return;
    const updatedBoard = board.map((value, ind) => {
      if (ind === boxId) {
        return currentPlayer.figure;
      } else {
        return value;
      }
    });
    setBoard(updatedBoard);
    // emitting the web socket
    socket.emit("make-move", { updatedBoard });
    if (checkForWinOrDraw(updatedBoard)) {
      return;
    } else {
      // setCurrentPlayer((prev) => (prev === "O" ? "X" : "O"));
    }
  };

  return (
    <div
      id="3x3"
      className="flex m-auto flex-col lg:w-full relative lg:flex-row lg:items-start"
    >
      <div className="flex-1 sticky top-0 lg:justify-end">
        <TitleBox
          message={
            result === "Win"
              ? `${currentPlayer} wins!`
              : result === "Draw"
              ? "Draw"
              : `${currentPlayer} to move`
          }
          subtitle={subtitle}
        />
      </div>
      <div className="flex-[2] lg:justify-start">
        <Board
          turn={currentPlayer.figure}
          onClick={handleBoxClick}
          board={board}
        />
      </div>
    </div>
  );
};

export default memo(OnlineGame);
