import { BoardType, PlayerType } from "./Game";
import styles from "./index.module.css";

interface BoardProps {
  board: BoardType;
  onClick: (num: number) => void;
  turn?: PlayerType;
}

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

  let result: boolean | string = false;

  for (const winningCombination of WINNING_COMBINATIONS) {
    if (winningCombination.every((num) => currentPositions.includes(num))) {
      result = currentPlayer;
    } else if (board.every((sym) => sym !== null)) {
      result = "draw";
    }
  }

  return result;
};

const Board = ({ board, onClick, turn }: BoardProps) => {
  
  
  return (
    <div
      className={`${styles.board} ${
        turn === "X" ? styles.X : styles.O
      } mt-[5vh] lg:mt-0`}
    >
      {board.map((value, ind) => {
        return (
          <div
            key={ind}
            className={styles.cell}
            data-value={value}
            onClick={() => {
              value === null && onClick(ind);
            }}
          ></div>
        );
      })}
    </div>
  );
};

export default Board;

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
