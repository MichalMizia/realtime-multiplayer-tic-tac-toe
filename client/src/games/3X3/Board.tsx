import { BoardType, PlayerType } from "./Game";
import styles from "./index.module.css";

interface BoardProps {
  board: BoardType;
  onClick: (num: number) => void;
  turn: PlayerType;
}

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
