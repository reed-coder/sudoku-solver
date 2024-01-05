"use client";

import { Cell, Sudoku } from "./utils/Sudoku";

const sudoku1 = [
  [0, 0, 0, 0, 4, 7, 8, 6, 0],
  [3, 6, 0, 0, 0, 0, 0, 7, 4],
  [0, 4, 0, 6, 2, 0, 0, 0, 0],
  [0, 9, 0, 4, 0, 6, 5, 0, 1],
  [0, 5, 0, 0, 0, 0, 0, 8, 0],
  [2, 0, 0, 0, 5, 0, 3, 4, 0],
  [5, 0, 9, 0, 0, 2, 0, 0, 0],
  [0, 0, 0, 7, 3, 4, 9, 5, 2],
  [0, 0, 0, 0, 0, 5, 0, 0, 0],
];
const sudoku2 = [
  [0, 0, 0, 0, 1, 0, 7, 2, 0],
  [0, 0, 3, 2, 7, 8, 0, 9, 0],
  [0, 5, 7, 0, 0, 0, 3, 0, 8],
  [0, 0, 0, 9, 6, 0, 0, 7, 1],
  [0, 0, 0, 0, 8, 2, 0, 6, 3],
  [1, 9, 6, 0, 0, 0, 0, 4, 2],
  [3, 0, 8, 0, 2, 9, 0, 0, 4],
  [0, 0, 9, 0, 5, 1, 0, 0, 0],
  [0, 6, 0, 7, 0, 3, 0, 8, 9],
];
const sudoku3 = [
  [0, 0, 0, 5, 0, 0, 0, 8, 4],
  [0, 3, 8, 0, 0, 0, 2, 0, 0],
  [0, 0, 5, 0, 0, 0, 0, 0, 0],
  [5, 1, 4, 0, 6, 0, 0, 7, 8],
  [0, 0, 7, 0, 8, 0, 0, 0, 9],
  [8, 2, 0, 0, 7, 0, 5, 6, 1],
  [0, 5, 1, 0, 0, 6, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 5],
  [4, 0, 2, 0, 5, 3, 1, 0, 0],
];

// create multuline-string for console output with horizntal and vertical lines
const createTextFromGrid = (grid: Cell[][]): string => {
  let textGrid = "";
  for (let i = 0; i < grid.length; i++) {
    if (i % 3 === 0 && i !== 0) {
      textGrid += "--- --- --- + --- --- --- + --- --- ---\n";
    }
    for (let j = 0; j < grid[i].length; j++) {
      if (j % 3 === 0 && j !== 0) {
        textGrid += "| ";
      }
      textGrid += grid[i][j].value
        ? ` ${grid[i][j].value.toString()} `
        : // : `(${grid[i][j].possibleNumbers.length})`;
          `(${grid[i][j].possibleNumbers.join(",")})`;
      textGrid += " ";
    }
    textGrid += "\n";
  }
  return textGrid;
};

export default function Home() {
  const removeGreen = () => {
    const inputs = Array.from(document.getElementsByClassName("sudoku-input"));
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i] as HTMLInputElement;
      input.classList.remove("bg-green-200");
    }
  };

  const setNumbersFromSudoku = (sudoku: Sudoku, rowIndex: number, columnIndex: number) => {
    // set input-x-y value
    removeGreen();
    sudoku.getGrid().forEach((row, i) =>
      row.forEach((cell: Cell, j) => {
        if (!cell.value) return;
        const input = document.getElementById(`input-${i}-${j}`) as HTMLInputElement;
        if (!input) return;
        input.value = cell.value.toString();
        if (cell.isPredefined) input.classList.add("bg-gray-200");
        if (i === rowIndex && j === columnIndex) input.classList.add("bg-green-200");
      }),
    );
  };

  const solve = async () => {
    // create 2d array from input-x-y 9x9
    const grid = Array.from(Array(9).keys()).map((i) =>
      Array.from(Array(9).keys()).map((j) => {
        const input = document.getElementById(`input-${i}-${j}`) as HTMLInputElement;
        if (!input) return 0;
        return parseInt(input.value || "") || 0;
      }),
    );
    const sudoku = new Sudoku(grid, setNumbersFromSudoku);

    console.log(createTextFromGrid(sudoku.getGrid()));
    sudoku.solve();
    console.log(createTextFromGrid(sudoku.getGrid()));
  };

  const clear = () => {
    const inputs = Array.from(document.getElementsByClassName("sudoku-input"));
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i] as HTMLInputElement;
      input.value = "";
      input.classList.remove("bg-gray-200", "bg-green-200");
    }
  };

  const prefill = (grid: number[][]) => {
    clear();
    grid.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (!cell) return;
        const input = document.getElementById(`input-${i}-${j}`) as HTMLInputElement;
        if (!input) return;
        input.value = cell.toString();
        input.classList.add("bg-gray-200");
      }),
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center h-full justify-center">
        {
          // generate grid with inputs 9x9
          Array.from(Array(9).keys()).map((i) => (
            <div key={i} className="flex">
              {Array.from(Array(9).keys()).map((j) => (
                <input
                  key={j}
                  className={`sudoku-input w-12 h-12 text-center text-2xl border border-gray-300 ${
                    i % 3 === 0 ? "border-t-2 border-t-gray-500" : ""
                  } ${j % 3 === 0 ? "border-l-2 border-l-gray-500" : ""}`}
                  type="number"
                  min="1"
                  max="9"
                  id={`input-${i}-${j}`}
                />
              ))}
            </div>
          ))
        }
        {/* solve button */}
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={solve}>
          Solve
        </button>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => prefill(sudoku1)}>
          Example Sudoku 1
        </button>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => prefill(sudoku2)}>
          Example Sudoku 2
        </button>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => prefill(sudoku3)}>
          Example Sudoku 3
        </button>
      </div>
    </main>
  );
}
