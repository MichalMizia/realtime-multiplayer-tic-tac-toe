import { useState } from "react";
import Board from "./Board";
import TitleBox from "@/components/TitleBox";
import { Button } from "@/components/ui/button";
import { Dice5, HomeIcon } from "lucide-react";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";

interface GameProps {}

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

const Game = ({}: GameProps) => {
  const [board, setBoard] = useState<BoardType>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<PlayerType>("X");
  const [result, setResult] = useState<ResultType>("Playing");

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
    const currentPositions = getAllIndexes(board, currentPlayer);

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
        return currentPlayer;
      } else {
        return value;
      }
    });
    setBoard(updatedBoard);
    if (checkForWinOrDraw(updatedBoard)) {
      return;
    } else {
      setCurrentPlayer((prev) => (prev === "O" ? "X" : "O"));
    }
  };

  const navigate = useNavigate();

  return (
    <div
      id="3x3"
      className="flex m-auto flex-col lg:w-full relative lg:flex-row lg:items-start"
    >
      <div className="flex-1 sticky top-0 lg:justify-end">
        <TitleBox
          main={
            <div className="flex items-stretch m-4 justify-center w-full gap-2 relative top-2 mx-auto">
              <Button
                className="w-full flex-1 !p-0"
                variant="outlined"
                type="button"
              >
                <a
                  href="/"
                  title="Homepage"
                  className="w-full h-full py-2 px-3 flex items-center justify-center"
                >
                  <HomeIcon className="w-5 h-5 mr-2 text-purple-dark" /> Home
                </a>
              </Button>
              <Button
                className="w-full flex-1"
                type="button"
                onClick={() => window.location.reload()}
              >
                Restart The Game
              </Button>
            </div>
          }
          footer={
            <div className="mt-2 w-full">
              <Button
                title="New Online Game"
                variant="outlined"
                className="w-full"
                onClick={() => {
                  const gameId = uuid();
                  console.log(gameId);
                  navigate(`/${gameId}`);
                }}
              >
                Play Online <Dice5 className="ml-1 w-5 h-5" />
              </Button>
            </div>
          }
          message={
            result === "Win"
              ? `${currentPlayer} wins!`
              : result === "Draw"
              ? "Draw"
              : `${currentPlayer} to move`
          }
          subtitle="Press the button to restart the game"
        />
      </div>
      <div className="flex-[2] lg:justify-start">
        <Board turn={currentPlayer} onClick={handleBoxClick} board={board} />
      </div>
    </div>
  );
};

export default Game;
